import { 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';

class ColdChainService {
  constructor() {
    this.isRunning = false;
    this.simulationInterval = null;
    this.sensors = [];
    this.listeners = [];
  }

  // Initialize sensors data
  async initializeSensors() {
    try {
      const sensorsRef = collection(db, 'sensors');
      const snapshot = await getDocs(sensorsRef);
      
      if (snapshot.empty) {
        // Create sample sensors if none exist
        const sampleSensors = [
          {
            name: 'Fridge 1',
            location: 'Storage Room A',
            acceptableTempMin: 2,
            acceptableTempMax: 8,
            acceptableHumidityMin: 30,
            acceptableHumidityMax: 60,
            createdAt: serverTimestamp()
          },
          {
            name: 'Freezer A',
            location: 'Storage Room B',
            acceptableTempMin: -25,
            acceptableTempMax: -15,
            acceptableHumidityMin: 20,
            acceptableHumidityMax: 50,
            createdAt: serverTimestamp()
          },
          {
            name: 'Fridge 2',
            location: 'Dispensing Area',
            acceptableTempMin: 2,
            acceptableTempMax: 8,
            acceptableHumidityMin: 30,
            acceptableHumidityMax: 60,
            createdAt: serverTimestamp()
          },
          {
            name: 'Freezer B',
            location: 'Storage Room C',
            acceptableTempMin: -25,
            acceptableTempMax: -15,
            acceptableHumidityMin: 20,
            acceptableHumidityMax: 50,
            createdAt: serverTimestamp()
          },
          {
            name: 'Fridge 3',
            location: 'Quarantine Area',
            acceptableTempMin: 2,
            acceptableTempMax: 8,
            acceptableHumidityMin: 30,
            acceptableHumidityMax: 60,
            createdAt: serverTimestamp()
          }
        ];

        for (const sensor of sampleSensors) {
          await addDoc(sensorsRef, sensor);
        }
      }

      // Load sensors
      await this.loadSensors();
      return true;
    } catch (error) {
      console.error('Error initializing sensors:', error);
      throw error;
    }
  }

  // Load sensors from Firestore
  async loadSensors() {
    try {
      const sensorsRef = collection(db, 'sensors');
      const snapshot = await getDocs(sensorsRef);
      this.sensors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return this.sensors;
    } catch (error) {
      console.error('Error loading sensors:', error);
      throw error;
    }
  }

  // Generate realistic sensor reading
  generateSensorReading(sensor) {
    const now = new Date();
    const hour = now.getHours();
    
    // Day/Night variation
    const isDay = hour >= 6 && hour < 18;
    const variation = isDay ? 0.5 : 0.3; // Less variation at night
    
    let temperature, humidity;
    
    if (sensor.name.includes('Freezer')) {
      // Freezer: -25 to -15°C
      const baseTemp = -20;
      const tempVariation = variation * 3;
      temperature = baseTemp + (Math.random() - 0.5) * tempVariation;
      
      // Freezer humidity: 20-50%
      const baseHumidity = 35;
      const humidityVariation = variation * 15;
      humidity = Math.max(20, Math.min(50, baseHumidity + (Math.random() - 0.5) * humidityVariation));
    } else {
      // Fridge: 2-8°C
      const baseTemp = 5;
      const tempVariation = variation * 2;
      temperature = baseTemp + (Math.random() - 0.5) * tempVariation;
      
      // Fridge humidity: 30-60%
      const baseHumidity = 45;
      const humidityVariation = variation * 20;
      humidity = Math.max(30, Math.min(60, baseHumidity + (Math.random() - 0.5) * humidityVariation));
    }

    return {
      sensorId: sensor.id,
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      timestamp: serverTimestamp()
    };
  }

  // Check if reading is within acceptable range
  isReadingValid(sensor, reading) {
    const tempValid = reading.temperature >= sensor.acceptableTempMin && 
                     reading.temperature <= sensor.acceptableTempMax;
    const humidityValid = reading.humidity >= sensor.acceptableHumidityMin && 
                         reading.humidity <= sensor.acceptableHumidityMax;
    
    return {
      valid: tempValid && humidityValid,
      tempValid,
      humidityValid,
      status: tempValid && humidityValid ? 'normal' : 
              !tempValid && !humidityValid ? 'error' : 'warning'
    };
  }

  // Create alert
  async createAlert(sensor, reading, type, threshold) {
    try {
      const alertsRef = collection(db, 'alerts');
      await addDoc(alertsRef, {
        sensorId: sensor.id,
        sensorName: sensor.name,
        type,
        value: type === 'temperature' ? reading.temperature : reading.humidity,
        threshold,
        status: 'active',
        createdAt: serverTimestamp(),
        resolvedAt: null
      });
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  // Store sensor reading
  async storeReading(reading) {
    try {
      const readingsRef = collection(db, 'sensorReadings');
      await addDoc(readingsRef, reading);
    } catch (error) {
      console.error('Error storing reading:', error);
    }
  }

  // Start simulation
  async start() {
    if (this.isRunning) return;

    try {
      await this.initializeSensors();
      this.isRunning = true;

      // Generate readings every 30 seconds
      this.simulationInterval = setInterval(async () => {
        for (const sensor of this.sensors) {
          const reading = this.generateSensorReading(sensor);
          const validation = this.isReadingValid(sensor, reading);
          
          // Store reading
          await this.storeReading(reading);
          
          // Create alerts for out-of-range readings
          if (!validation.tempValid) {
            const threshold = reading.temperature > sensor.acceptableTempMax ? 
              sensor.acceptableTempMax : sensor.acceptableTempMin;
            await this.createAlert(sensor, reading, 'temperature', threshold);
          }
          
          if (!validation.humidityValid) {
            const threshold = reading.humidity > sensor.acceptableHumidityMax ? 
              sensor.acceptableHumidityMax : sensor.acceptableHumidityMin;
            await this.createAlert(sensor, reading, 'humidity', threshold);
          }
        }
      }, 30000); // 30 seconds

      console.log('Cold Chain simulation started');
    } catch (error) {
      console.error('Error starting simulation:', error);
      throw error;
    }
  }

  // Stop simulation
  stop() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isRunning = false;
    
    // Remove all listeners
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
    
    console.log('Cold Chain simulation stopped');
  }

  // Listen to real-time sensor readings
  onSensorReadings(callback) {
    const readingsRef = collection(db, 'sensorReadings');
    const q = query(readingsRef, orderBy('timestamp', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const readings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(readings);
    });
    
    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  // Listen to real-time sensors
  onSensors(callback) {
    const sensorsRef = collection(db, 'sensors');
    
    const unsubscribe = onSnapshot(sensorsRef, (snapshot) => {
      const sensors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      this.sensors = sensors;
      callback(sensors);
    });
    
    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  // Listen to real-time alerts
  onAlerts(callback) {
    const alertsRef = collection(db, 'alerts');
    const q = query(alertsRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(alerts);
    });
    
    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  // Get historical readings
  async getHistoricalReadings(sensorId, startDate, endDate) {
    try {
      const readingsRef = collection(db, 'sensorReadings');
      let q = query(readingsRef, orderBy('timestamp', 'desc'));
      
      if (sensorId) {
        q = query(readingsRef, where('sensorId', '==', sensorId), orderBy('timestamp', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting historical readings:', error);
      throw error;
    }
  }

  // Resolve alert
  async resolveAlert(alertId) {
    try {
      const alertRef = doc(db, 'alerts', alertId);
      await updateDoc(alertRef, {
        status: 'resolved',
        resolvedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  // Delete alert
  async deleteAlert(alertId) {
    try {
      const alertRef = doc(db, 'alerts', alertId);
      await deleteDoc(alertRef);
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }

  // Update sensor settings
  async updateSensorSettings(sensorId, settings) {
    try {
      const sensorRef = doc(db, 'sensors', sensorId);
      await updateDoc(sensorRef, settings);
    } catch (error) {
      console.error('Error updating sensor settings:', error);
      throw error;
    }
  }

  // Get status
  getStatus() {
    return {
      isRunning: this.isRunning,
      sensorsCount: this.sensors.length,
      lastUpdate: new Date().toISOString()
    };
  }
}

export default new ColdChainService();
