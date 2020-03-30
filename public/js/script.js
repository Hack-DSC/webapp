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

    const app = new Vue({
        el: '#app',
        data: {
            user: null,
            faq: [
                {
                    question: 'What\'s a Hackathon?',
                    answer: '[answer here]'
                },
                {
                    question: 'Who can join?',
                    answer: 'Any post-secondary/collegiate student from any background'
                },
                {
                    question: 'What platforms are we using?',
                    answer: 'Discord & Youtube Live'
                },
                {
                    question: 'Can I work on things in advance?',
                    answer: 'See early bird track'
                },
                {
                    question: 'How much does the event cost?',
                    answer: 'Free'
                },
                {
                    question: 'How will winners receive their prizes?',
                    answer: 'Shipped Directly'
                },
                {
                    question: 'Do I need to be in a DSC?',
                    answer: 'Nope! But we encourage you to join one or start your own!'
                }
            ],
            events: [],
            calendar: null
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
                events: [
                    {
                        title: 'Test Event',
                        start: dayjs('2020-04-24T13:00:00.000Z').toDate(),
                        end: dayjs('2020-04-24T16:00:00.000Z').toDate()
                    },
                    {
                        title: 'Test Event',
                        start: dayjs('2020-04-25T16:00:00.000Z').toDate(),
                        end: dayjs('2020-04-25T20:00:00.000Z').toDate()
                    }
                ],
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
        }
    });
});