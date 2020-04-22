document.addEventListener('DOMContentLoaded', function () {
    Vue.use(Vuefire.firestorePlugin)

    const startDate = dayjs('2020-04-24')

    const app = new Vue({
        el: '#live',
        data: {
            user: null,
            hacker: null,
            events: [],
            sponsors: [],
            resources: [],
            announcements: [],
            scheduleDay: 1,
            selectedEvent: null,
            scheduleScrollTimeout: null
        },
        firestore: {
            events: firebase.firestore().collection('events'),
            announcements: firebase.firestore().collection('announcements'),
        },
        mounted() {
            Promise.allSettled(['sponsors', 'resources'].map(c => this.fetchData(c)))
        },
        watch: {
            
        },
        computed: {
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
            async fetchData (collection) {
                try {
                    const response = await fetch(`/data/${collection}.json`)
                    this[collection] = await response.json()
                } catch (e) {
                    alert(`There was an issue getting the ${collection}.`)
                }
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
        }
    })
})