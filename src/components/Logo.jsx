import React, { Component } from 'react';
import { Text, StyleSheet } from 'react-native';

class Logo extends Component {
	render() {
		return (
			<Text style={styles.text}>❔2️⃣⌚</Text>
		);
	}
}

export default Logo;

const styles = StyleSheet.create({
	text: {
		fontSize: 60,
		color: 'white'
	},
});