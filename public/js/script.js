
document.addEventListener('DOMContentLoaded', function () {
    const provider = new firebase.auth.GoogleAuthProvider()
    Vue.use(Vuefire.firestorePlugin)

    const app = new Vue({
        el: '#app',
        data: {
            countdown: {
                days: 0,
                hours: 0,
                minutes: 0
            },
            user: null,
            hacker: null,
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
                this.user = user
                if (user) {
                    console.log('Is logged in as ' + user.email)

                    this.$bind('hacker', firebase.firestore().collection('hackers').doc(user.uid))
                        .then(hacker => {
                            if (!hacker) {
                                this.openRegistrationModal()
                            }
                        })
                    
                } else {
                    this.$unbind('hacker')
                    console.log('Is logged out')
                }
            })

            this.calendar = new FullCalendar.Calendar(this.$refs.calendar, {
                plugins: ['dayGrid', 'timeGrid'],
                defaultView: 'timeGrid',
                events: (fetchInfo, successCallback, failureCallback) => successCallback(this.convertedEvents),
                header: {
                    left: '',
                    center: '',
                    right: ''
                },
                visibleRange: {
                    start: '2020-04-24',
                    end: '2020-04-27'
                },
                slotDuration: '01:00:00',
                allDaySlot: false,
                height: '600'
            })

            this.calendar.render()

            setInterval(this.updateCountDown, 1000)
            this.updateCountDown()
        },
        methods: {
            updateCountDown () {
                let distance = dayjs('2020-04-27T01:00:00.000Z').diff(new Date(), 'milliseconds')
                this.countdown.days = Math.floor(distance / (1000 * 60 * 60 * 24));
                this.countdown.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                this.countdown.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                this.countdown.seconds = Math.floor((distance % (1000 * 60)) / 1000);
            },
            async startGoogleAuth() {
                try {
                    const result = await firebase.auth().signInWithPopup(provider)
                    // const token = result.credential.accessToken
                } catch (e) {
                     // Handle Errors here.
                     const errorCode = error.code
                     const errorMessage = error.message
                     // The email of the user's account used.
                     const email = error.email
                     // The firebase.auth.AuthCredential type that was used.
                     const credential = error.credential
                }
            },
            openRegistrationModal () {
                $('#registration-modal').modal('show')
            },
            async finishRegistration (event) {
                const displayName = event.target.displayName.value
                const school = event.target.school.value
                const schoolEmail = event.target['school-email'].value
                const grade = event.target['grade-level'].value
                const hackathonCount = event.target['hackathon-count'].value
                const experience = event.target.experience.value
                

                try {
                    await firebase.auth().currentUser.updateProfile({
                        displayName
                    })
                    await firebase.firestore().collection('hackers').doc(this.user.uid).set({
                        school,
                        schoolEmail,
                        grade,
                        hackathonCount,
                        experience
                    })

                    $('#registration-modal').modal('hide')
                } catch (e) {
                    alert('There was an error finishing your registration. Please try again later.')
                }
            }
        },
        watch: {
            events () {
                this.calendar.refetchEvents()
            },
            hacker (newHacker) {
                if (newHacker === null) {
                    $('#registration-modal').modal('show')
                } else {
                    $('#registration-modal').modal('hide')
                }
            }
        },
        computed: {
            loggedIn () {
                return this.user !== null
            },
            registered () {
                return this.hacker !== null
            },
            // From Firestore documents to FullCalendar events
            convertedEvents () {
                return this.events.map(event => ({
                    title: event.title,
                    start: event.start.toDate(),
                    end: event.end.toDate(),
                }))
            }
        }
    })
})