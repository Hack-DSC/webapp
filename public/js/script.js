
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
            team: [],
            sponsors: [],
            calendar: null
        },
        firestore: {
            faqs: firebase.firestore().collection('faqs'),
            events: firebase.firestore().collection('events'),
            team: firebase.firestore().collection('team'),
            sponsors: firebase.firestore().collection('sponsors'),
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
                    try {
                        this.$unbind('hacker')
                    } catch (e) {

                    }
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
                allDaySlot: true,
                allDayText: 'All Day',
                contentHeight: 600,
                scrollTime: '08:00:00',
                eventRender({ event, el }) {
                    $(el).popover({
                        title: event.title,
                        trigger: 'click hover',
                        html: true,
                        content: event.extendedProps.description || 'No description given.'
                    })
                }
            })

            this.calendar.render()

            setInterval(this.updateCountDown, 1000)
            this.updateCountDown()
        },
        methods: {
            updateCountDown() {
                let distance = dayjs('2020-04-27T01:00:00.000Z').diff(new Date(), 'milliseconds')
                this.countdown.days = Math.floor(distance / (1000 * 60 * 60 * 24))
                this.countdown.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                this.countdown.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                this.countdown.seconds = Math.floor((distance % (1000 * 60)) / 1000)
            },
            async startGoogleAuth() {
                try {
                    const result = await firebase.auth().signInWithPopup(provider)
                    // const token = result.credential.accessToken
                } catch (error) {
                    // Handle Errors here.
                    const errorCode = error.code
                    const errorMessage = error.message
                    alert(errorMessage)
                    // The email of the user's account used.
                    const email = error.email
                    // The firebase.auth.AuthCredential type that was used.
                    const credential = error.credential
                }
            },
            openRegistrationModal() {
                $('#registration-modal').modal('show')
            },
            async finishRegistration(event) {
                const displayName = event.target.displayName.value
                const gender = event.target.gender.value
                const school = event.target.school.value
                const schoolEmail = event.target['school-email'].value
                const year = event.target.year.value
                const major = event.target.major.value
                const hackathonCount = event.target['hackathon-count'].value
                const specialty = event.target.specialty.value
                const shareResumeWithSponors = event.target['share-with-sponsors'].checked

                const hacker = {
                    name: displayName,
                    gender,
                    school,
                    major,
                    specialty,
                    schoolEmail,
                    year,
                    hackathonCount,
                    shareResumeWithSponors
                }

                const resume = event.target.resume.files[0]

                if (resume) {
                    const upload = await firebase.storage().ref().child('resumes').child(this.user.uid + '.pdf').put(resume)
                    upload.ref.getDownloadURL().then(function (downloadURL) {
                        hacker.resumeURL = downloadURL
                    })
                }

                try {
                    await firebase.auth().currentUser.updateProfile({
                        displayName
                    })
                    await firebase.firestore().collection('hackers').doc(this.user.uid).set(hacker)

                    $('#registration-modal').modal('hide')
                } catch (e) {
                    console.error(e)
                    alert('There was an error finishing your registration. Please try again later.')
                }
            },

        },
        watch: {
            events() {
                this.calendar.refetchEvents()
            },
            hacker(newHacker) {
                if (newHacker === null) {
                    $('#registration-modal').modal('show')
                } else {
                    $('#registration-modal').modal('hide')
                }
            }
        },
        computed: {
            loggedIn() {
                return this.user !== null
            },
            registered() {
                return this.hacker !== null
            },
            // From Firestore documents to FullCalendar events
            convertedEvents() {
                const eventColors = {
                    main: 'var(--danger)',
                    workshop: 'var(--primary)',
                    judging: 'var(--warning)',
                    misc: 'var(--success)'

                }
                return this.events.map(event => ({
                    id: event.id,
                    title: event.title,
                    start: event.start.toDate(),
                    end: event.end ? event.end.toDate() : undefined,
                    allDay: event.end === undefined,
                    description: event.description,
                    textColor: 'white',
                    color: eventColors[event.category] || 'var(--success)'
                }))
            }
        }
    })
})