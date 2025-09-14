import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DemoScreen from './screens/DemoScreen';
import ShakeScreen from './screens/ShakeScreen';

export default function App() {
  const [mode, setMode] = useState<'DEMO' | 'SHAKE'>('DEMO');
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topToggle}>
        <TouchableOpacity onPress={() => setMode('DEMO')} style={[styles.toggleBtn, mode === 'DEMO' && styles.toggleBtnActive]}>
          <Text style={[styles.toggleText, mode === 'DEMO' && styles.toggleTextActive]}>Demo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode('SHAKE')} style={[styles.toggleBtn, mode === 'SHAKE' && styles.toggleBtnActive]}>
          <Text style={[styles.toggleText, mode === 'SHAKE' && styles.toggleTextActive]}>Shake to Charge</Text>
        </TouchableOpacity>
      </View>
      {mode === 'DEMO' ? <DemoScreen /> : <ShakeScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  topToggle: {
    flexDirection: 'row',
    marginTop: 50,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
  },
  toggleBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#f2f2f2' },
  toggleBtnActive: { backgroundColor: '#e0f2f1' },
  toggleText: { textAlign: 'center', fontWeight: '600', color: '#444' },
  toggleTextActive: { color: '#00695c' },
});
