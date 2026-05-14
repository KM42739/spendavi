import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Speech from 'expo-speech';

const defaultBills = [
  { id: 'rent', name: 'Rent / Mortgage', amount: '900', dueDay: '1' },
  { id: 'council', name: 'Council Tax', amount: '150', dueDay: '5' },
  { id: 'phone', name: 'Phone', amount: '45', dueDay: '18' },
];

const defaultDebts = [
  { id: 'card', name: 'Credit Card', balance: '2500', apr: '24.9', minimum: '75' },
  { id: 'loan', name: 'Loan', balance: '5000', apr: '9.9', minimum: '160' },
];

function toNumber(value) {
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function currency(value) {
  return `£${toNumber(value).toFixed(2)}`;
}

function monthlyInterest(balance, apr) {
  return toNumber(balance) * (toNumber(apr) / 100 / 12);
}

function getRiskLabel(score) {
  if (score >= 70) return 'Red';
  if (score >= 40) return 'Amber';
  return 'Green';
}

export default function App() {
  const [tab, setTab] = useState('today');
  const [balance, setBalance] = useState('740');
  const [daysToPayday, setDaysToPayday] = useState('12');
  const [buffer, setBuffer] = useState('150');
  const [essentials, setEssentials] = useState('450');
  const [goal, setGoal] = useState('Clear high-interest debt');
  const [bills] = useState(defaultBills);
  const [debts] = useState(defaultDebts);
  const [spend, setSpend] = useState('takeaway');
  const [amount, setAmount] = useState('40');
  const [decision, setDecision] = useState(null);

  const totals = useMemo(() => {
    const days = Math.max(0, Math.round(toNumber(daysToPayday)) || 0);
    const billsTotal = bills.reduce((sum, bill) => sum + toNumber(bill.amount), 0);
    const minimums = debts.reduce((sum, debt) => sum + toNumber(debt.minimum), 0);
    const interest = debts.reduce((sum, debt) => sum + monthlyInterest(debt.balance, debt.apr), 0);
    const protectedMoney = billsTotal + minimums + (toNumber(essentials) / 30) * days + toNumber(buffer);
    const safeToSpend = toNumber(balance) - protectedMoney;
    const highestDebt = debts.reduce((top, debt) => (!top || toNumber(debt.apr) > toNumber(top.apr) ? debt : top), null);
    return { days, billsTotal, minimums, interest, protectedMoney, safeToSpend, highestDebt };
  }, [balance, daysToPayday, essentials, buffer, bills, debts]);

  function askSpendavi() {
    const spendAmount = toNumber(amount);
    const safeAfter = totals.safeToSpend - spendAmount;
    let score = 0;
    if (safeAfter < 0) score += 50;
    if (safeAfter < toNumber(buffer) * 0.25) score += 20;
    if (totals.safeToSpend > 0 && spendAmount > totals.safeToSpend * 0.5) score += 15;
    if (totals.days > 7 && spendAmount > 50) score += 15;
    if (['takeaway', 'clothes', 'trainers', 'amazon', 'taxi', 'shopping'].some((word) => spend.toLowerCase().includes(word))) score += 10;

    const risk = getRiskLabel(score);
    const debt = totals.highestDebt;
    const impact = debt ? `If you paid ${currency(spendAmount)} toward ${debt.name} instead, you would avoid around ${currency(monthlyInterest(spendAmount, debt.apr))} interest next month.` : 'No debt impact calculated.';
    const message = risk === 'Red' ? 'This spend is not safe right now.' : risk === 'Amber' ? 'This spend is possible, but it creates pressure.' : 'This spend appears safe.';

    const result = {
      risk,
      message,
      safeBefore: totals.safeToSpend,
      safeAfter,
      impact,
      challenge: risk === 'Green' ? 'Stay within your remaining safe-to-spend amount.' : `Pause. Is this more important than your goal to ${goal.toLowerCase()}?`,
    };

    setDecision(result);
    setTab('check');
    Speech.speak(`${risk}. ${message}. Safe after spend would be ${currency(safeAfter)}.`, { rate: 0.92 });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo}><Text style={styles.logoText}>S</Text></View>
          <View><Text style={styles.title}>Spendavi</Text><Text style={styles.subtitle}>Ask before you spend</Text></View>
        </View>

        {tab === 'today' && (
          <View>
            <View style={styles.hero}>
              <Text style={styles.label}>Safe to spend until payday</Text>
              <Text style={[styles.safeAmount, totals.safeToSpend < 0 && styles.redText]}>{currency(totals.safeToSpend)}</Text>
              <Text style={styles.copy}>Spendavi protects bills, debt payments, essential spending and your buffer before it tells you what is safe to spend.</Text>
            </View>
            <SpendCheck spend={spend} setSpend={setSpend} amount={amount} setAmount={setAmount} onAsk={askSpendavi} />
          </View>
        )}

        {tab === 'check' && (
          <View>
            <SpendCheck spend={spend} setSpend={setSpend} amount={amount} setAmount={setAmount} onAsk={askSpendavi} />
            {decision && <Decision decision={decision} />}
          </View>
        )}

        {tab === 'profile' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile</Text>
            <Input label="Current balance" value={balance} onChangeText={setBalance} />
            <Input label="Days until payday" value={daysToPayday} onChangeText={setDaysToPayday} />
            <Input label="Monthly essentials" value={essentials} onChangeText={setEssentials} />
            <Input label="Emergency buffer" value={buffer} onChangeText={setBuffer} />
            <Input label="Goal" value={goal} onChangeText={setGoal} />
          </View>
        )}
      </ScrollView>

      <View style={styles.nav}>
        <NavButton active={tab === 'today'} label="Today" onPress={() => setTab('today')} />
        <NavButton active={tab === 'check'} label="Check" onPress={() => setTab('check')} />
        <NavButton active={tab === 'profile'} label="Profile" onPress={() => setTab('profile')} />
      </View>
    </SafeAreaView>
  );
}

function SpendCheck({ spend, setSpend, amount, setAmount, onAsk }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Spend Check</Text>
      <Input label="Spend" value={spend} onChangeText={setSpend} />
      <Input label="Amount" value={amount} onChangeText={setAmount} />
      <TouchableOpacity style={styles.primary} onPress={onAsk}><Text style={styles.primaryText}>Ask Spendavi</Text></TouchableOpacity>
    </View>
  );
}

function Decision({ decision }) {
  return (
    <View style={[styles.card, decision.risk === 'Red' && styles.redCard, decision.risk === 'Amber' && styles.amberCard]}>
      <Text style={styles.label}>Spendavi decision</Text>
      <Text style={styles.result}>{decision.risk}</Text>
      <Text style={styles.copy}>{decision.message}</Text>
      <Text style={styles.copy}>Safe before: {currency(decision.safeBefore)}</Text>
      <Text style={styles.copy}>Safe after: {currency(decision.safeAfter)}</Text>
      <Text style={styles.copy}>{decision.impact}</Text>
      <Text style={styles.challenge}>{decision.challenge}</Text>
    </View>
  );
}

function Input({ label, value, onChangeText }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholderTextColor="#64748b" />
    </View>
  );
}

function NavButton({ active, label, onPress }) {
  return <TouchableOpacity style={[styles.navButton, active && styles.navActive]} onPress={onPress}><Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#070a12' },
  container: { padding: 18, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  logo: { width: 50, height: 50, borderRadius: 18, backgroundColor: '#34d399', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#07110b', fontSize: 24, fontWeight: '900' },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#94a3b8' },
  hero: { backgroundColor: '#064e3b', borderRadius: 28, padding: 20, marginBottom: 16 },
  label: { color: '#a7f3d0', fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  safeAmount: { color: '#fff', fontSize: 52, fontWeight: '900', marginVertical: 8 },
  redText: { color: '#fecaca' },
  copy: { color: '#cbd5e1', lineHeight: 22, marginTop: 8 },
  card: { backgroundColor: '#111827', borderRadius: 26, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#1f2937' },
  redCard: { backgroundColor: '#3f1212', borderColor: '#ef4444' },
  amberCard: { backgroundColor: '#3b2f0b', borderColor: '#d97706' },
  cardTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 12 },
  inputWrap: { marginBottom: 12 },
  inputLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginBottom: 6 },
  input: { backgroundColor: '#070a12', color: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#334155', padding: 14 },
  primary: { backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center' },
  primaryText: { color: '#07110b', fontSize: 16, fontWeight: '900' },
  result: { color: '#fff', fontSize: 44, fontWeight: '900', marginTop: 6 },
  challenge: { color: '#fff', marginTop: 12, padding: 14, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.24)', fontWeight: '900', lineHeight: 22 },
  nav: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#111827', borderRadius: 28, padding: 8, flexDirection: 'row', borderWidth: 1, borderColor: '#1f2937' },
  navButton: { flex: 1, alignItems: 'center', borderRadius: 20, paddingVertical: 12 },
  navActive: { backgroundColor: '#fff' },
  navText: { color: '#cbd5e1', fontWeight: '900' },
  navTextActive: { color: '#07110b' },
});
