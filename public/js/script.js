
document.addEventListener('DOMContentLoaded', function () {
    const provider = new firebase.auth.GoogleAuthProvider()
    Vue.use(Vuefire.firestorePlugin)

    const startDate = dayjs('2020-04-24')

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
            resources: [],
            scheduleDay: 1,
            selectedEvent: null,
            scheduleScrollTimeout: null
        },
        firestore: {
            faqs: firebase.firestore().collection('faqs'),
            events: firebase.firestore().collection('events'),
            team: firebase.firestore().collection('team'),
            sponsors: firebase.firestore().collection('sponsors'),
        },
        mounted() {
            this.fetchData()

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

                    firebase.analytics().logEvent('login')
                } else {
                    try {
                        this.$unbind('hacker')
                    } catch (e) {

                    }
                    console.log('Is logged out')
                }
            })

            setInterval(this.updateCountDown, 1000)
            this.updateCountDown()
        },
        watch: {
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
            scheduleDayDate () {
                return startDate.add(this.scheduleDay - 1, 'days')
            },
            scheduleDayDisplay () {
                return this.scheduleDayDate.format('dddd, MMMM D')
            },
            sortedEvents () {
                return this.events.sort((a, b) => a.start.toDate() - b.start.toDate())
            }
        },
        methods: {
            async fetchData () {
                const response = await fetch('/data/resources.json')
                this.resources = await response.json()
            },
            updateCountDown() {
                let distance = dayjs('2020-04-25T01:00:00.000Z').diff(new Date(), 'milliseconds')
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
            selectEvent (event) {
                this.selectedEvent = event
                $('#event-modal').modal('show')
            },
            formatTimestamp (ts) {
                return dayjs(ts.toDate()).format('h:mm a')
            },
            formatTimestampDate (ts) {
                return dayjs(ts.toDate()).format('dddd, MMMM D')
            },
            categoryClass (category) {
                return {
                    main: 'danger',
                    workshop: 'primary',
                    judging: 'warning',
                    misc: 'success'
                }[category] || 'success'
            },
            categoryDisplay (category) {
                return {
                    main: 'Main Event',
                    workshop: 'Workshop',
                    judging: 'Judging'
                }[category] || 'Event'
            },
            debounceScheduleScroll (event) {
                if (this.scheduleScrollTimeout) clearTimeout(this.scheduleScrollTimeout)
                this.scheduleScrollTimeout = setTimeout(() => this.handleScheduleScroll(event), 200)
            },
            handleScheduleScroll (event) {
                // Determine which day we are looking at
                let newDay = 1
                for (let i = 1; i <= 3; i++) {
                    const firstDayEvent = this.sortedEvents.find(event => dayjs(event.start.toDate())
                        .isSame(startDate
                        .add(i - 1, 'days'), 'day'))
                    const target = document.getElementById('event-' + firstDayEvent.id)
                    
                    // Are we scrolled past it??
                    if (target.parentNode.scrollTop >= (target.offsetTop - target.parentNode.offsetTop)) {
                        newDay = i
                    }
                }

                this.scheduleDay = newDay
            },
            scrollToScheduleDay (day) {
                const firstDayEvent = this.sortedEvents.find(event => dayjs(event.start.toDate())
                    .isSame(startDate
                    .add(day - 1, 'days'), 'day'))
                if (firstDayEvent) {
                    const target = document.getElementById('event-' + firstDayEvent.id)
                    target.parentNode.scrollTop = target.offsetTop - target.parentNode.offsetTop
                }
            },
            openRegistrationModal() {
                $('#registration-modal').modal('show')
            },
            cancelRegistration() {
                $('#registration-modal').modal('hide')
            },
            async finishRegistration(event) {
                if (!event.target['mlh-authorize'].checked || !event.target['mlh-code-of-conduct'].checked) return alert('Make sure you read and accept the conditions at the bottom first!')

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
                    hacker.resumeURL = await upload.ref.getDownloadURL()
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
            async sendEmail(event) {
                const newContact = {
                    name: event.target.name.value,
                    fromEmail: event.target.email.value,
                    message: event.target.message.value 
                }
                
                firebase.firestore().collection('contact').add(newContact)
                alert('Your message has been sent!')

                event.target.name.value = ''
                event.target.email.value = ''
                event.target.message.value = ''
            },

        }
    })
})