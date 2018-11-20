import Vue from 'vue';
import Show from './Show.vue';

new Vue({
	el: '#app',
	components: {
		Show
	},
	render: h => h(Show)
});