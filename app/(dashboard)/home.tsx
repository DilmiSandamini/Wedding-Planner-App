import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/services/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { user } = useAuth();
  const [wedding, setWedding] = useState<any>(null);
  
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "wedding_plans", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWedding(data);
      }
    });

    const timer = setInterval(() => {
      if (wedding?.weddingDate) {
        const weddingDate = new Date(wedding.weddingDate).getTime();
        const now = new Date().getTime();
        const diff = weddingDate - now;

        if (diff > 0) {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);

          setTimeLeft({
            days: d < 10 ? `0${d}` : `${d}`,
            hours: h < 10 ? `0${h}` : `${h}`,
            minutes: m < 10 ? `0${m}` : `${m}`,
            seconds: s < 10 ? `0${s}` : `${s}`
          });
        }
      }
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer); 
    };
  }, [user, wedding?.weddingDate]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mt-10 mb-8">
          <View>
            <Text className="text-gray-400 font-medium">Hello, {user?.displayName || 'Partner'}</Text>
            <Text className="text-2xl font-bold text-gray-900">Enjoy Your Best Wedding! ❤️</Text>
          </View>
          <TouchableOpacity className="bg-gray-100 p-3 rounded-full border border-gray-200">
            <Ionicons name="notifications" size={20} color="#5D603E" />
          </TouchableOpacity>
        </View>

        {/* Hero Banner with Real-time Countdown */}
        <LinearGradient
          colors={['#5D603E', '#8D916B']}
          className="rounded-[35px] p-7 mb-8 shadow-xl shadow-[#5D603E]/30"
        >
          <Text className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-1">
            {wedding?.planName || "Our Wedding Plan"}
          </Text>
          <Text className="text-white text-3xl font-bold mb-6">
            {wedding?.coupleName || "Couple Names"}
          </Text>
          
          {/* Real-time Timer UI */}
          <View className="flex-row justify-between bg-white/10 p-4 rounded-3xl border border-white/20">
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{timeLeft.days}</Text>
              <Text className="text-white/60 text-[10px] font-bold uppercase">Days</Text>
            </View>
            <Text className="text-white/30 text-xl font-bold">:</Text>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{timeLeft.hours}</Text>
              <Text className="text-white/60 text-[10px] font-bold uppercase">Hrs</Text>
            </View>
            <Text className="text-white/30 text-xl font-bold">:</Text>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{timeLeft.minutes}</Text>
              <Text className="text-white/60 text-[10px] font-bold uppercase">Min</Text>
            </View>
            <Text className="text-white/30 text-xl font-bold">:</Text>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{timeLeft.seconds}</Text>
              <Text className="text-white/60 text-[10px] font-bold uppercase">Sec</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Wedding Summary Stats */}
        <Text className="text-lg font-bold text-gray-900 mb-4">Wedding Summary</Text>
        <View className="flex-row justify-between mb-8">
          <View className="bg-orange-50 p-5 rounded-3xl w-[47%] items-center border border-orange-100">
            <Ionicons name="people" size={28} color="#FB923C" />
            <Text className="text-orange-900 font-bold mt-2 text-lg">{wedding?.guests || 0}</Text>
            <Text className="text-orange-400 text-[10px] uppercase font-extrabold tracking-tighter">Expected Guests</Text>
          </View>
          <View className="bg-blue-50 p-5 rounded-3xl w-[47%] items-center border border-blue-100">
            <Ionicons name="wallet" size={28} color="#60A5FA" />
            <Text className="text-blue-900 font-bold mt-2 text-lg">{wedding?.budget || 'N/A'}</Text>
            <Text className="text-blue-400 text-[10px] uppercase font-extrabold tracking-tighter">Total Budget</Text>
          </View>
        </View>

        {/* Decorative Banner */}
        {/* <View className="w-full h-44 rounded-[35px] overflow-hidden mb-8">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop' }} 
            className="w-full h-full"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            className="absolute inset-0 justify-end p-6"
          >
            <Text className="text-white text-xl font-bold">Plan Your Dream Day</Text>
            <Text className="text-white/80 text-xs">"Where love stories come true"</Text>
          </LinearGradient>
        </View> */}

      </ScrollView>
    </SafeAreaView>
  );
}