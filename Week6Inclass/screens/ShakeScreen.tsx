import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Battery from 'expo-battery';
import { Accelerometer } from 'expo-sensors';

const WIDTH = 260;
const HEIGHT = 48;
const CAP_W = 10;
const SHAKE_THRESHOLD = 1.35;
const INCREMENT_PER_TICK = 1;
const TICK_MS = 200;

export default function ShakeScreen() {
  const [percent, setPercent] = useState(0);
  const [initialPct, setInitialPct] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const lastTickRef = useRef(0);
  const subRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const lvl = await Battery.getBatteryLevelAsync();
        const pct = Math.round((lvl ?? 0) * 100);
        if (!mounted) return;
        setPercent(pct);
        setInitialPct(pct);
      } catch {
        setPercent(25);
        setInitialPct(25);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    Accelerometer.setUpdateInterval(TICK_MS);
    subRef.current = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (mag > SHAKE_THRESHOLD && now - lastTickRef.current >= TICK_MS) {
        lastTickRef.current = now;
        setPercent(p => {
          const next = Math.min(100, p + INCREMENT_PER_TICK);
          if (next === 100) setIsFull(true);
          return next;
        });
      }
    });
    return () => {
      subRef.current?.remove?.();
      subRef.current = null;
    };
  }, []);

  const fillColor = percent < 20 ? '#e53935' : percent <= 50 ? '#fdd835' : '#43a047';

  const resetToReal = async () => {
    try {
      const lvl = await Battery.getBatteryLevelAsync();
      const pct = Math.round((lvl ?? 0) * 100);
      setPercent(pct);
      setInitialPct(pct);
      setIsFull(false);
    } catch {}
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Shake to Charge</Text>
      <Text style={styles.subtle}>Starts at your real battery: {initialPct}%</Text>
      <Text style={styles.percent}>{percent}%</Text>
      <View style={styles.batteryRow}>
        <View style={styles.batteryBody}>
          <View style={[styles.fill, { width: (Math.max(percent, 0) / 100) * WIDTH, backgroundColor: fillColor }]} />
        </View>
        <View style={styles.batteryCap} />
      </View>
      {isFull ? (
        <Text style={styles.full}>Fully charged</Text>
      ) : (
        <Text style={styles.subtle}>Shake your phone to fill the battery</Text>
      )}
      <TouchableOpacity onPress={resetToReal} style={[styles.button, { marginTop: 16, backgroundColor: '#2e7d32' }]}>
        <Text style={{ color: 'white', fontWeight: '700' }}>Reset to real battery</Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' ? (
        <Text style={styles.note}>Use a real iPhone. Simulator won’t show values.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  subtle: { fontSize: 14, color: '#666', marginBottom: 8 },
  percent: { fontSize: 48, fontWeight: '800', marginBottom: 16 },
  batteryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  batteryBody: {
    width: WIDTH,
    height: HEIGHT,
    borderWidth: 3,
    borderRadius: 6,
    borderColor: '#444',
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  batteryCap: {
    width: CAP_W,
    height: HEIGHT * 0.5,
    marginLeft: 4,
    borderWidth: 3,
    borderColor: '#444',
    borderRadius: 2,
    backgroundColor: '#eee',
  },
  fill: { height: '100%' },
  full: { marginTop: 6, fontSize: 16, fontWeight: '700', color: '#43a047' },
  button: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#2e7d32', borderRadius: 8 },
  note: { marginTop: 12, fontSize: 12, color: '#666' },
});
