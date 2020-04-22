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
        }
    })
})