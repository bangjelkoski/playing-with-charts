import Vue from 'vue'

// Importing the dependecies
import {Http} from './resource'
import VueAxios from 'vue-axios'

// Using the dependecies
Vue.use(VueAxios, Http)

import App from './App.vue'
new Vue({
  el: '#app',
  render: h => h(App)
})
