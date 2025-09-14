import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Battery from 'expo-battery';

type Accel = { x: number; y: number; z: number };

export default function DemoScreen() {
  const [{ x, y, z }, setAccel] = useState<Accel>({ x: 0, y: 0, z: 0 });
  const [accelOn, setAccelOn] = useState(true);
  const [batteryPct, setBatteryPct] = useState<number | null>(null);
  const [chargingText, setChargingText] = useState<string>('unknown');

  useEffect(() => {
    const sub = Accelerometer.addListener((data: Accel) => setAccel(data));
    Accelerometer.setUpdateInterval(200);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const lvl = await Battery.getBatteryLevelAsync();
      const pct = Math.round((lvl ?? 0) * 100);
      const power = await Battery.getPowerStateAsync();
      if (!mounted) return;
      setBatteryPct(pct);
      setChargingText(stateToText(power?.batteryState));
      const bl = Battery.addBatteryLevelListener(({ batteryLevel }) => {
        setBatteryPct(Math.round((batteryLevel ?? 0) * 100));
      });
      const bs = Battery.addBatteryStateListener(({ batteryState }) => {
        setChargingText(stateToText(batteryState));
      });
      return () => {
        bl.remove();
        bs.remove();
      };
    };
    let cleanup: undefined | (() => void);
    run().then((c) => {
      if (typeof c === 'function') cleanup = c;
    });
    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  const toggleAccel = () => {
    if (accelOn) {
      Accelerometer.removeAllListeners();
      setAccelOn(false);
    } else {
      const sub = Accelerometer.addListener((data: Accel) => setAccel(data));
      setAccelOn(true);
      return () => sub.remove();
    }
  };

  const slow = () => Accelerometer.setUpdateInterval(1000);
  const fast = () => Accelerometer.setUpdateInterval(200);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>In-Class Demo</Text>
      <Text style={styles.label}>Accelerometer (1g ≈ 9.81 m/s²)</Text>
      <Text style={styles.center}>x: {x.toFixed(3)}</Text>
      <Text style={styles.center}>y: {y.toFixed(3)}</Text>
      <Text style={styles.center}>z: {z.toFixed(3)}</Text>

      <View style={styles.row}>
        <TouchableOpacity onPress={toggleAccel} style={styles.button}>
          <Text>{accelOn ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={slow} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 28 }} />

      <Text style={styles.label}>Battery</Text>
      <Text style={styles.center}>Level: {batteryPct === null ? '...' : `${batteryPct}%`}</Text>
      <Text style={styles.center}>Charging: {chargingText}</Text>
    </View>
  );
}

function stateToText(batteryState?: Battery.BatteryState | null) {
  switch (batteryState) {
    case Battery.BatteryState.CHARGING:
      return 'charging';
    case Battery.BatteryState.UNPLUGGED:
      return 'not charging';
    case Battery.BatteryState.FULL:
      return 'full';
    default:
      return 'unknown';
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 6, marginBottom: 6 },
  center: { textAlign: 'center', fontSize: 15, marginVertical: 2 },
  row: { flexDirection: 'row', alignItems: 'stretch', marginTop: 15 },
  button: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee', padding: 10 },
  middleButton: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#ccc' },
});
