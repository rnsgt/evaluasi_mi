import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ToastNotification = ({ 
  message, 
  type = 'info', 
  visible, 
  onHide, 
  duration = 3500 
}) => {
  const [shouldRender, setShouldRender] = useState(visible);
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: Platform.OS === 'ios' ? 60 : 40,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShouldRender(false);
      if (onHide) onHide();
    });
  };

  if (!shouldRender && !visible) return null;

  const getTheme = () => {
    switch (type) {
      case 'success': return { bg: '#10B981', icon: 'check-decagram' };
      case 'error': return { bg: '#EF4444', icon: 'alert-circle-outline' };
      case 'warning': return { bg: '#F59E0B', icon: 'alert-outline' };
      case 'info': return { bg: '#3B82F6', icon: 'information-outline' };
      default: return { bg: '#3B82F6', icon: 'information-outline' };
    }
  };

  const theme = getTheme();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: theme.bg,
        },
        styles.shadow
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={theme.icon} size={22} color="white" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{type.toUpperCase()}</Text>
          <Text style={styles.message} numberOfLines={2}>{message}</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={hideToast}>
          <MaterialCommunityIcons name="close" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 20,
    zIndex: 99999,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  message: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 5,
    marginLeft: 5,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
});

export default ToastNotification;
