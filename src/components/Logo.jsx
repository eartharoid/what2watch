import React, { Component } from 'react';
import { Text, StyleSheet } from 'react-native';

export default class Logo extends Component {
	render() {
		return (
			<Text style={styles.text}>❔2️⃣⌚</Text>
		);
	}
}

const styles = StyleSheet.create({
	text: {
		fontSize: 60,
		color: 'white'
	},
});