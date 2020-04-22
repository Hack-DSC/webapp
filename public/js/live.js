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
            scheduleDay: 1,
            selectedEvent: null,
            scheduleScrollTimeout: null
        },
        firestore: {
            events: firebase.firestore().collection('events'),
            sponsors: firebase.firestore().collection('sponsors'),
        },
        mounted() {
            
        },
        watch: {
            
        },
        computed: {
            
        },
        methods: {

        }
    })
})