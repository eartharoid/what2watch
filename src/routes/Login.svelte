<script>
	const firebase = require('firebase');
	const firebaseui = require('firebaseui');
	const ui = new firebaseui.auth.AuthUI(firebase.auth());
	ui.start('#firebaseui-auth-container', {
		signInOptions: [
			firebase.auth.EmailAuthProvider.PROVIDER_ID
		]
	});

</script>

<main>
	LOGIN
</main>