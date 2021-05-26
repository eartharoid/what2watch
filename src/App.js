import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, ImageBackground  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from './components/Logo';

export default function App() {
	return (
		<View style={styles.container}>
			<ImageBackground source={require('./assets/background.jpg')} style={styles.imgBackground}>
				<LinearGradient
					colors={['rgba(2,0,36,1)', 'rgba(9,9,121,1)', 'rgba(0,212,255,1)']}
					start={[0.1, 0.1]}
					style={styles.linearGradient}
				>
					<StatusBar style={styles.statusBar} />
					<Logo />
					<Text style={styles.text}>React Native</Text>
				</LinearGradient>
			</ImageBackground>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
		alignItems: 'center',
		justifyContent: 'center',
	},
	imgBackground: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
	},
	linearGradient: {
		width: '100%',
		height: '100%',
		opacity: 0.9, // 0.95
		justifyContent: 'center',
		alignItems: 'center'
	},
	text: {
		color: 'white',
		fontSize: 40,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	statusBar: {
		color: 'white'
	}
});