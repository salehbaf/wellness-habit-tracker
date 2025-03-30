import React, { useState, useEffect } from 'react';

import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Button, 
  FlatList, 
  TouchableOpacity, 
  Keyboard, 
  Alert 
} from 'react-native';


import AsyncStorage from '@react-native-async-storage/async-storage';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

export default function App() {
 // enable animations on Android
  if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  
  // main state values
  const [habit, setHabit] = useState('');
  const [habits, setHabits] = useState([]);
  const [streak, setStreak] = useState(0);
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');

  // list of motivational quotes
const quotes = [
  "Consistency is better than intensity.",
  "Small steps every day lead to big results.",
  "Your health is your wealth.",
  "Breathe. Relax. You've got this.",
  "Wellness is a daily practice.",
  "Stay present, stay grateful."
];

 // show greeting and a random quote when app loads
useEffect(() => {
  const hour = new Date().getHours();
  if (hour < 12) setGreeting("Good Morning ☀️");
  else if (hour < 18) setGreeting("Good Afternoon 🌤️");
  else setGreeting("Good Evening 🌙");

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  setQuote(randomQuote);
}, []);

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    saveHabits();
  }, [habits]);

  // maps keywords to related wellness emojis
  const emojiMap = {
    water: "💧",
    meditate: "🧘‍♂️",
    walk: "🌳",
    fruit: "🍎",
    prayer: "📿",
    relax: "🕊️",
    sun: "☀️",
    salad: "🥗",
    sleep: "😴",
  };
  
  const emojiList = Object.values(emojiMap);
  
  // adds a new habit to the list
  const addHabit = () => {
     
    // prevent empty habit input
    if (habit.trim() === '') {
        Alert.alert('Please enter a habit.');
        return;
      }
  
      // Match keyword
      const lowerHabit = habit.toLowerCase();
      let foundEmoji = null;
      Object.keys(emojiMap).forEach((keyword) => {
        if (lowerHabit.includes(keyword)) {
          foundEmoji = emojiMap[keyword];
        }
      });
  
      // Fallback to random emoji if no keyword match
      const emoji = foundEmoji || emojiList[Math.floor(Math.random() * emojiList.length)];
  
      const newHabit = { 
          id: Date.now().toString(), 
          name: habit, 
          completed: false,
          emoji: emoji
      };

        // fade animation when adding new habit
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      // update habit list
      setHabits([newHabit, ...habits]);
      setHabit('');
      Keyboard.dismiss();
  };
  
// toggle habit done/undone
  const toggleHabit = (id) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        if (!h.completed) setStreak(streak + 1);
        else setStreak(streak - 1);
        return { ...h, completed: !h.completed };
      }
      return h;
    });
    setHabits(updated);
  };

  // delete habit on long press
  const deleteHabit = (id) => {
    const filteredHabits = habits.filter((h) => h.id !== id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
    setHabits(filteredHabits);
  };

    // save data to local storage
  const saveHabits = async () => {
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(habits));
      await AsyncStorage.setItem('streak', JSON.stringify(streak));
    } catch (error) {
      console.log('Error saving habits', error);
    }
  };

  // load data from local storage
  const loadHabits = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('habits');
      const storedStreak = await AsyncStorage.getItem('streak');
      if (storedHabits) setHabits(JSON.parse(storedHabits));
      if (storedStreak) setStreak(JSON.parse(storedStreak));
    } catch (error) {
      console.log('Error loading habits', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Daily Wellness Habit Tracker</Text>
      <Text style={styles.quote}>“Small habits, big changes.”</Text>
      <Text style={styles.streak}>Current Streak: {streak}</Text>
      <Text style={styles.greeting}>{greeting}</Text>
    <Text style={styles.dailyQuote}>"{quote}"</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Add a new habit..."
        value={habit}
        onChangeText={setHabit}
      />
     
     <TouchableOpacity style={styles.button} onPress={addHabit}>
  <Text style={styles.buttonText}>ADD HABIT</Text>
</TouchableOpacity>

<FlatList
  data={habits}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity 
      onPress={() => toggleHabit(item.id)} 
      onLongPress={() => deleteHabit(item.id)} // this is the new feature
    >
      <Text style={[styles.habit, item.completed && styles.completed]}>
        {item.completed ? '✅' : '☐'} {item.emoji} {item.name}
      </Text>
    </TouchableOpacity>
  )}
/>
</View>
);
}

// styles for the UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
    color: '#222',
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  streak: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },

  completed: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  button: {
    backgroundColor: '#00796B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  greeting: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 5,
    color: '#1E3D59',
  },
  dailyQuote: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    color: '#4A6572',
  },
  habit: {
    fontSize: 18,
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    color: '#333',
}
});