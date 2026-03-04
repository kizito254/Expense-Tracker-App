import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const currency = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

const categories = {
  income: ['Salary', 'Freelance', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Housing', 'Utilities', 'Shopping', 'Other'],
};

export default function App() {
  const [entries, setEntries] = useState([
    { id: 1, type: 'income', category: 'Salary', amount: 3200, note: 'Monthly paycheck' },
    { id: 2, type: 'expense', category: 'Housing', amount: 1200, note: 'Rent' },
    { id: 3, type: 'expense', category: 'Food', amount: 210, note: 'Groceries' },
    { id: 4, type: 'income', category: 'Freelance', amount: 450, note: 'Design project' },
  ]);

  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(categories.expense[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const summary = useMemo(() => {
    const income = entries
      .filter((entry) => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const expense = entries
      .filter((entry) => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const groupedExpenses = entries
      .filter((entry) => entry.type === 'expense')
      .reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
        return acc;
      }, {});

    return {
      income,
      expense,
      balance: income - expense,
      groupedExpenses,
      maxCategoryExpense: Math.max(...Object.values(groupedExpenses), 1),
    };
  }, [entries]);

  const switchType = (nextType) => {
    setType(nextType);
    setCategory(categories[nextType][0]);
  };

  const addEntry = () => {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) return;

    setEntries((prev) => [
      {
        id: Date.now(),
        type,
        category,
        amount: parsed,
        note: note.trim() || '-',
      },
      ...prev,
    ]);

    setAmount('');
    setNote('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Expense Tracker</Text>
        <Text style={styles.subtitle}>Track income and expenses with quick charts</Text>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.label}>Balance</Text>
            <Text style={styles.balance}>{currency(summary.balance)}</Text>
          </View>
          <View style={styles.rowSpaced}>
            <Text style={styles.income}>↑ {currency(summary.income)}</Text>
            <Text style={styles.expense}>↓ {currency(summary.expense)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add transaction</Text>
          <View style={styles.toggleRow}>
            {['income', 'expense'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.toggle,
                  type === option &&
                    (option === 'income' ? styles.toggleIncomeActive : styles.toggleExpenseActive),
                ]}
                onPress={() => switchType(option)}
              >
                <Text style={styles.toggleText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Amount"
            keyboardType="numeric"
            style={styles.input}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryStrip}>
            {categories[type].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.categoryChip, category === item && styles.categoryChipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.categoryChipText, category === item && styles.categoryChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Note"
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={addEntry}>
            <Text style={styles.buttonText}>Save transaction</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Expense chart (by category)</Text>
          {Object.keys(summary.groupedExpenses).length === 0 ? (
            <Text style={styles.empty}>No expenses yet.</Text>
          ) : (
            Object.entries(summary.groupedExpenses).map(([name, value]) => (
              <View key={name} style={styles.chartRow}>
                <Text style={styles.chartLabel}>{name}</Text>
                <View style={styles.chartTrack}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        width: `${(value / summary.maxCategoryExpense) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartValue}>{currency(value)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.entryRow}>
              <View>
                <Text style={styles.entryCategory}>{entry.category}</Text>
                <Text style={styles.entryNote}>{entry.note}</Text>
              </View>
              <Text style={entry.type === 'income' ? styles.amountIncome : styles.amountExpense}>
                {entry.type === 'income' ? '+' : '-'} {currency(entry.amount)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  subtitle: { color: '#6b7280' },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#111827',
    gap: 12,
  },
  label: { color: '#9ca3af' },
  balance: { color: 'white', fontSize: 28, fontWeight: '700' },
  rowSpaced: { flexDirection: 'row', justifyContent: 'space-between' },
  income: { color: '#86efac', fontWeight: '600' },
  expense: { color: '#fca5a5', fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 14, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggle: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleIncomeActive: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  toggleExpenseActive: { backgroundColor: '#fee2e2', borderColor: '#dc2626' },
  toggleText: { textTransform: 'capitalize', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryStrip: { maxHeight: 40 },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: '#dbeafe', borderColor: '#2563eb' },
  categoryChipText: { color: '#374151' },
  categoryChipTextActive: { color: '#1d4ed8', fontWeight: '600' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '600' },
  empty: { color: '#6b7280' },
  chartRow: { gap: 6 },
  chartLabel: { color: '#374151', fontWeight: '500' },
  chartTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  chartBar: { height: '100%', backgroundColor: '#ef4444', borderRadius: 999 },
  chartValue: { color: '#6b7280', fontSize: 12 },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#f3f4f6',
    paddingTop: 10,
  },
  entryCategory: { fontWeight: '600', color: '#1f2937' },
  entryNote: { color: '#6b7280', fontSize: 12 },
  amountIncome: { color: '#16a34a', fontWeight: '600' },
  amountExpense: { color: '#dc2626', fontWeight: '600' },
});
