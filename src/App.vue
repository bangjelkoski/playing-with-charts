<template>
  <div class="main">
      <div class="content">
          <div id="chart">
              <monthGraph :chartData="addBlankMonth" :options="options" v-if="!isWeek && isReady"></monthGraph>
              <weekGraph :chartData="addBlankWeek" :options="options" v-if="isWeek && isReady"></weekGraph>
          </div>

          <div class="week" style="margin-bottom: 20px;" v-if="isWeek">
            <button class="btn" @click="previousWeek"><</button>
            <button class="btn" @click="nextWeek">></button>
          </div>
          <div class="week" style="margin-bottom: 20px;" v-if="!isWeek">
            <button class="btn" @click="previousMonth"><</button>
            <button class="btn" @click="nextMonth">></button>
          </div>
          <button class="btn" @click="isWeek = !isWeek">Switch View</button>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!isWeek">
                <td>Month</td>
                <td>${{ totalMonth[currentMonth] }}</td>
              </tr>
              <tr v-if="isWeek">
                <td>Week</td>
                <td>${{ totalWeek[currentWeek] }}</td>
              </tr>
            </tbody>
          </table>
      </div>
  </div>
</template>

<script>
import MonthGraph from './components/MonthGraph.vue';
import WeekGraph from './components/WeekGraph.vue';

export default {
  data () {
    return {
      isReady: false, // Waiting for the response
      isWeek: true, // Switching between Month and Week
      currentWeek: 0, // The current week we are in
      currentMonth: 0, // The current month we are in
      maxWeek: 0, // Maximum number of weeks to implement a Infinite Loop
      maxMonth: 0, // Maximum number of weeks to implement a Infinite Loop
      weekData: [], // Data for the Week Chart
      totalWeek: [],  // Total sales per week
      totalMonth: [],  // Total month sales
      monthData: [], // Data for the Month Chart
      options: {  // Some options for the charts
        responsive: true,
        maintainAspectRatio: false,
        scaleFontColor: 'red',
        scales: {
            xAxes: [{ 
                gridLines: {
                    display: false,
                },
                ticks: {
                  fontColor: "white", 
                },
            }],
            yAxes: [{
                gridLines: {
                    display: false,
                },
                ticks: {
                  fontColor: "white", 
                },
            }],
        }
      }
    }
  },
  methods: {
    previousWeek (){
      this.currentWeek = this.currentWeek == 0 ? this.maxWeek : this.currentWeek - 1;
    },
    nextWeek () {
      this.currentWeek = this.currentWeek == this.maxWeek ? 0 : this.currentWeek + 1;
    },
    previousMonth (){
      this.currentMonth = this.currentMonth == 0 ? this.maxMonth : this.currentMonth - 1;
    },
    nextMonth () {
      this.currentMonth = this.currentMonth == this.maxMonth ? 0 : this.currentMonth + 1;
    }
  },
  computed: {
      addBlankWeek (i) {
          if(this.weekData[this.currentWeek].datasets[0].data.length == 1){

            // Push some dummy data to center if there is only one point
            this.weekData[this.currentWeek].datasets[0].data[1] = this.weekData[this.currentWeek].datasets[0].data[0];
            this.weekData[this.currentWeek].datasets[0].data[0] = 0;
            this.weekData[this.currentWeek].datasets[0].data[2] = 0;

            this.weekData[this.currentWeek].labels[1] = this.weekData[this.currentWeek].labels[0];
            this.weekData[this.currentWeek].labels[0] = '';
            this.weekData[this.currentWeek].labels[2] = '';
          }
          return this.weekData[this.currentWeek]
      },
      addBlankMonth (i) {
          if(this.monthData[this.currentMonth].datasets[0].data.length == 1){

            // Push some dummy data to center if there is only one point
            this.monthData[this.currentMonth].datasets[0].data[1] = this.monthData[this.currentMonth].datasets[0].data[0];
            this.monthData[this.currentMonth].datasets[0].data[0] = 0;
            this.monthData[this.currentMonth].datasets[0].data[2] = 0;

            this.monthData[this.currentMonth].labels[1] = this.monthData[this.currentMonth].labels[0];
            this.monthData[this.currentMonth].labels[0] = '';
            this.monthData[this.currentMonth].labels[2] = '';
          }
          return this.monthData[this.currentMonth]
      }
  },
  created () {

    // We get the data in the created method of the Component's lifecycle 
    this.$http.get('/sales').then(res => {

      let data = res.data;

      // Sort the data by date
      data.sort((a, b) => {
        return new Date(a.published_at) - new Date(b.published_at);
      });

      // Format the date
      data = data.map( item => {
        let date = new Date(item.published_at),
          total = Number(item.sale.replace(/[^0-9\.-]+/g, "")),
          tmp = {
            date: {
              week: date.getDay(),
              month: date.getDate() + '/' + (date.getMonth() + 1),
            },
            sale: total
          }
        return tmp;
      })

      // Compress all duplicate dates
      var current = 1;
      for(let i = 1; i < data.length; i++){
        if(data[i].date.month === data[i-current].date.month){
            data[i-current].sale += data[i].sale;
            delete data[i];
            current++;
        }else{
            current = 1;
        }
      }

      // Month Data
      var current = -1, curr = 0, month = 0;
      data.forEach( item => {
          let month_number = item.date.month.split('/')[1];
          if(month_number > current){

            // Push a new object in the data weekMoth property, also add new total per month
            if(!month){
               let obj = {
                labels: [],
                  datasets: [
                    {
                      label: 'Month ' + month_number,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderColor: '#007dc1',
                      pointBorderColor: '#007dc1',
                      pointBackgroundColor: '#007dc1',
                      pointHoverBackgroundColor: '#007dc1',
                      pointHoverBorderColor: '#007dc1',
                      pointBorderWidth: 1,
                      borderWidth: 1,
                      data: [],
                    }
                  ]
               }
               this.monthData[curr] = obj;
               this.totalMonth[curr] = 0
               month = 1;
            }
            current = month_number;

            // Push the data
            this.totalMonth[curr] += item.sale;
            this.monthData[curr].labels.push(month_number);
            this.monthData[curr].datasets[0].data.push(item.sale);
        }else{
          curr++;
          month = 0;
          current = -1;
        }
      });
      this.maxMonth = curr;

      // Weekly Data
      var current = -1, week = 0, curr = 0;
      data.forEach( item => {
          if(item.date.week > current){

            // Push a new object in the data weekData property, also add new total per week
            if(!week){
               let obj = {
                labels: [],
                  datasets: [
                    {
                      label: 'Week ' + curr,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderColor: '#007dc1',
                      pointBorderColor: '#007dc1',
                      pointBackgroundColor: '#007dc1',
                      pointHoverBackgroundColor: '#007dc1',
                      pointHoverBorderColor: '#007dc1',
                      pointBorderWidth: 1,
                      borderWidth: 1,
                      data: [],
                    }
                  ]
               }
               this.weekData[curr] = obj;
               this.totalWeek[curr] = 0
               week = 1;
            }
            current = item.date.week;

            // Push the data
            this.totalWeek[curr] += item.sale;
            this.weekData[curr].labels.push(item.date.month);
            this.weekData[curr].datasets[0].data.push(item.sale);

          }else{
            curr++;
            week = 0;
            current = -1;
          }
      });

      this.maxWeek = curr - 1;
      this.isReady = true;

    }).catch(err => {
      console.log(err);
    });
  },
  components: {
      MonthGraph,
      WeekGraph,
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Open+Sans');
*{
  font-family: 'Open Sans', sans-serif;
}
body{
  margin: 0;
}
.main{
  background: #de6262; /* fallback for old browsers */
  background: -webkit-linear-gradient(to top, #de6262, #ffb88c); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to top, #de6262, #ffb88c); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  position: fixed; 
  left: 0;
  width: 100%; 
  height: 100%;

  .content{
      padding-top: 5%;
      width: 80%;
      margin: 0 auto;
      height: 100%;
      text-align: center;
      position: relative;
      overflow: hidden;

      .chartjs-size-monitor{
        position: relative;
      }
      
      #chart{
          margin-bottom: 40px;
      }

      #bar-chart{
          height: 300px !important;
          position: relative;
      }
  }
}

/* Animating the component switch */
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s ease-in-out
}

.fade-enter, .fade-leave-to{
  opacity: 0
}

/* Styling the button */
button{
  box-shadow: rgb(84, 163, 247) 0px 1px 0px 0px inset;
  background: linear-gradient(rgb(0, 125, 193) 5%, rgb(0, 97, 167) 100%) rgb(0, 125, 193);
  border-radius: 3px;
  border: 1px solid rgb(18, 77, 119);
  display: inline-block;
  cursor: pointer;
  color: rgb(255, 255, 255);
  font-size: 15px;
  padding: 6px 24px;
  text-decoration: none;
  text-shadow: rgb(21, 70, 130) 0px 1px 0px;
}

table {
  border: 1px solid #fefefe;
  border-collapse: collapse;
  margin: 20px 0 0;
  padding: 0;
  width: 100%;
  table-layout: fixed;
}
table tr {
  background: rgba(#f8f8f8, .8);
  border: 1px solid #fefefe;
  padding: .35em;
}
table th,
table td {
  padding: .625em;
  text-align: center;
}
table th {
  font-size: .85em;
  letter-spacing: .1em;
  text-transform: uppercase;
}
</style>
