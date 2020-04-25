document.addEventListener('DOMContentLoaded', function () {
    Vue.use(Vuefire.firestorePlugin)
    dayjs.extend(dayjs_plugin_isBetween)

    const startDate = dayjs('2020-04-24')

    const app = new Vue({
        el: '#live',
        data: {
            countdown: {
                days: 0,
                hours: 0,
                minutes: 0
            },
            requestMentor: {
                discord: '',
                help: ''
            },
            user: null,
            hacker: null,
            events: [],
            sponsors: [],
            resources: [],
            announcements: [],
            scheduleDay: 1,
            selectedEvent: null,
            scheduleScrollTimeout: null,
            now: new Date()
        },
        firestore: {
            events: firebase.firestore().collection('events'),
            announcements: firebase.firestore().collection('announcements')
        },
        mounted() {
            Promise.allSettled(['sponsors', 'resources'].map(c => this.fetchData(c)))

            firebase.auth().onAuthStateChanged(user => {
                this.user = user
                if (user) {
                    console.log('Is logged in as ' + user.email)

                    this.$bind('hacker', firebase.firestore().collection('hackers').doc(user.uid))
                        .then(hacker => {
                            if (!hacker) {
                                alert('You have not registered yet!')
                                window.location = '/'
                            }
                        })

                    firebase.analytics().logEvent('login')
                } else {
                    alert('You have not registered yet!')
                    window.location = '/'
                    try {
                        this.$unbind('hacker')
                    } catch (e) {
                        console.error('Could not unbind hacker')
                    }
                    console.log('Is logged out')
                }
            })

            setInterval(() => this.now = new Date(), 1000 * 60)
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
            scheduleDayDate() {
                return startDate.add(this.scheduleDay - 1, 'days')
            },
            scheduleDayDisplay() {
                return this.scheduleDayDate.format('dddd, MMMM D')
            },
            sortedEvents() {
                return this.events.sort((a, b) => a.start.toDate() - b.start.toDate())
            },
            recentAnnouncements() {
                return this.announcements.filter(ann => !ann.test).reverse().slice(0, 4);
            }
        },
        methods: {
            updateCountDown() {
                let distance = dayjs('2020-04-25T00:00:00.000Z').diff(new Date(), 'milliseconds')
                this.countdown.days = Math.floor(distance / (1000 * 60 * 60 * 24))
                this.countdown.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                this.countdown.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                this.countdown.seconds = Math.floor((distance % (1000 * 60)) / 1000)
            },
            async fetchData(collection) {
                try {
                    const response = await fetch(`/data/${collection}.json`)
                    this[collection] = await response.json()
                } catch (e) {
                    alert(`There was an issue getting the ${collection}.`)
                }
            },
            eventTimeDisplay (event) {
                const start = dayjs(event.start.toDate())
                const end = (event.start.toDate())

                if (dayjs(this.now).isBefore(end)) {
                    return 'Coming up'
                } else if (dayjs(this.now).isBetween(start, end)) {
                    return 'In progress'
                } else {
                    return 'Done'
                }
            },
            submitMentorHelp() {
                firebase.firestore().collection('mentorRequests').add(this.requestMentor)

                $('#request-mentor-modal').modal('hide')
                
                alert('Submitted request to the mentors! You will be contacted on Discord.')

                this.requestMentor.discord = ''
                this.requestMentor.help = ''
            },
            selectEvent (event) {
                this.selectedEvent = event
                $('#event-modal').modal('show')
            },
            formatTimestamp(ts) {
                return dayjs(ts.toDate()).format('h:mm a')
            },
            formatTimestampDate(ts) {
                return dayjs(ts.toDate()).format('dddd, MMMM D')
            },
            categoryClass(category) {
                return {
                    main: 'danger',
                    workshop: 'primary',
                    judging: 'warning',
                    misc: 'success'
                }[category] || 'success'
            },
            categoryDisplay(category) {
                return {
                    main: 'Main Event',
                    workshop: 'Workshop',
                    judging: 'Judging'
                }[category] || 'Event'
            },
            debounceScheduleScroll(event) {
                if (this.scheduleScrollTimeout) clearTimeout(this.scheduleScrollTimeout)
                this.scheduleScrollTimeout = setTimeout(() => this.handleScheduleScroll(event), 200)
            },
            handleScheduleScroll(event) {
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
            scrollToScheduleDay(day) {
                const firstDayEvent = this.sortedEvents.find(event => dayjs(event.start.toDate())
                    .isSame(startDate
                        .add(day - 1, 'days'), 'day'))
                if (firstDayEvent) {
                    const target = document.getElementById('event-' + firstDayEvent.id)
                    target.parentNode.scrollTop = target.offsetTop - target.parentNode.offsetTop
                }
            },
        }
    })
})