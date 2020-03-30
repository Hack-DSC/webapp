document.addEventListener('DOMContentLoaded', function () {
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    // // The Firebase SDK is initialized and available here!
    //
    // firebase.auth().onAuthStateChanged(user => { });
    // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    // firebase.messaging().requestPermission().then(() => { });
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
    //
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

    var provider = new firebase.auth.GoogleAuthProvider();

    Vue.use(Vuefire.firestorePlugin)

    const app = new Vue({
        el: '#app',
        data: {
            user: null,
            faqs: [],
            events: [],
            calendar: null
        },
        firestore: {
            faqs: firebase.firestore().collection('faqs'),
            events: firebase.firestore().collection('events')
        },
        mounted() {

            firebase.auth().onAuthStateChanged(user => {
                this.user = user;
                if (user) {
                    console.log('Is logged in as ' + user.email)
                } else {
                    console.log('Is logged out')
                }
            });

            this.calendar = new FullCalendar.Calendar(this.$refs.calendar, {
                plugins: ['dayGrid', 'timeGrid'],
                defaultView: 'timeGrid',
                events: (fetchInfo, successCallback, failureCallback) => successCallback(this.convertedEvents),
                header: {
                    left: '',
                    center: '',
                    right: ''
                },
                // columnHeaderFormat: {
                //     weekday: 'long'
                // },
                visibleRange: {
                    start: '2020-04-24',
                    end: '2020-04-27'
                },
                slotDuration: '01:00:00',
                allDaySlot: false,
                height: '600'
            })

            this.calendar.render()
        },
        methods: {
            startGoogleAuth() {
                firebase.auth().signInWithPopup(provider).then(function (result) {
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    var token = result.credential.accessToken;
                    // The signed-in user info.
                    var user = result.user;
                    // ...
                    alert(user.displayName)
                }).catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // The email of the user's account used.
                    var email = error.email;
                    // The firebase.auth.AuthCredential type that was used.
                    var credential = error.credential;
                    // ...
                });
            }
        },
        watch: {
            events () {
                this.calendar.refetchEvents()
            }
        },
        computed: {
            convertedEvents () {
                return this.events.map(event => ({
                    title: event.title,
                    start: event.start.toDate(),
                    end: event.end.toDate(),
                }))
            }
        }
    });
});