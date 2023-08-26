<template>
  <div class="subcontent">
    <div class="row justify-center">
      <div style="display: flex; max-width: 800px; width: 100%; height: 400px">
        <q-calendar-day
          ref="calendar"
          v-model="selectedDate"
          view="week"
          animated
          bordered
          :weekdays="[1, 2, 3, 4, 5, 6, 7, 0]"
          transition-next="slide-left"
          transition-prev="slide-right"
          locale="pt-BR"
          no-active-date
          :interval-start="7"
          :interval-count="18"
          :interval-height="28"
          :disabled-after="disabledAfter"
          :disabled-before="disabledBefore"
          v-touch-swipe.mouse.left.right="handleSwipe"
          @change="onChange"
          @moved="onMoved"
          @click-date="onClickDate"
          @click-time="onClickTime"
          @click-interval="onClickInterval"
          @click-head-intervals="onClickHeadIntervals"
          @click-head-day="onClickHeadDay"
        >
          <template #head-day-event="{ scope: { timestamp } }">
            <div
              style="
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                padding: 2px;
              "
            >
              <template v-for="event in [timestamp.date]" :key="event.id">
                <q-badge
                  v-if="!event.time"
                  :class="badgeClasses(event, 'header')"
                  :style="badgeStyles(event, 'header')"
                  style="
                    width: 100%;
                    cursor: pointer;
                    height: 12px;
                    font-size: 10px;
                    margin: 1px;
                  "
                >
                  <span class="title q-calendar__ellipsis">
                    {{ event.title }}
                    <q-tooltip>{{ event.details }}</q-tooltip>
                  </span>
                </q-badge>
                <q-badge
                  v-else
                  :class="badgeClasses(event, 'header')"
                  :style="badgeStyles(event, 'header')"
                  style="
                    margin: 1px;
                    width: 10px;
                    max-width: 10px;
                    height: 10px;
                    max-height: 10px;
                  "
                  @click="scrollToEvent(event)"
                >
                  <q-tooltip>{{
                    event.time + " - " + event.details
                  }}</q-tooltip>
                </q-badge>
              </template>
            </div>
          </template>

          <template
            #day-body="{
              scope: { timestamp, timeStartPos, timeDurationHeight },
            }"
          >
            <template
              v-for="event in getEvents(timestamp.date)"
              :key="event.id"
            >
              <div
                v-if="event.time !== undefined"
                class="my-event"
                :class="badgeClasses(event, 'body')"
                :style="
                  badgeStyles(event, 'body', timeStartPos, timeDurationHeight)
                "
              >
                <span class="title q-calendar__ellipsis">
                  {{ event.title }}
                  <q-tooltip>{{ event.details }}</q-tooltip>
                </span>
              </div>
            </template>
          </template>
        </q-calendar-day>
      </div>
    </div>
  </div>
</template>

<script>
import {
  QCalendarDay,
  addToDate,
  parseTimestamp,
  isBetweenDates,
  today,
  parsed,
  parseDate,
  parseTime,
} from "@quasar/quasar-ui-qcalendar/src/QCalendarDay.js";
import "@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass";
import "@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass";
import "@quasar/quasar-ui-qcalendar/src/QCalendarDay.sass";

import { defineComponent } from "vue";

// The function below is used to set up our demo data
const CURRENT_DAY = new Date();
function getCurrentDay(day) {
  const newDay = new Date(CURRENT_DAY);
  newDay.setDate(day);
  const tm = parseDate(newDay);
  return tm.date;
}

export default defineComponent({
  name: "WeekSlotDayBody",
  components: {
    QCalendarDay,
  },
  data() {
    return {
      selectedDate: "2023-10-04",
      events: [
        {
          id: 1,
          title: "Abertura – Som mecânico",
          details: "Time to pitch my idea to the company",
          date: "2023-10-04",
          time: "09:00",
          duration: 60,
          bgcolor: "red",
          icon: "fas fa-handshake",
        },
        {
          id: 1,
          title: "Abertura – Som mecânico",
          details: "Time to pitch my idea to the company",
          date: "2023-10-04",
          time: "10:00",
          duration: 60,
          bgcolor: "red",
          icon: "fas fa-handshake",
        },
        {
          id: 2,
          title: "Banda Os Fritz",
          details: "Company is paying!",
          date: "2023-10-05",
          time: "12:00",
          duration: 60,
          bgcolor: "teal",
          icon: "fas fa-hamburger",
        },
        {
          id: 3,
          title: "Abertura – Som mecânico",
          details: "Teaching Javascript 081",
          date: "2023-10-06",
          time: "13:00",
          duration: 60,
          bgcolor: "blue",
          icon: "fas fa-chalkboard-teacher",
        },
        {
          id: 4,
          title: "Abertura – Som mecânico",
          details: "Meet GF for dinner at Swanky Restaurant",
          date: "2023-10-07",
          time: "19:00",
          duration: 60,
          bgcolor: "teal-2",
          icon: "fas fa-utensils",
        },
      ],
      dragging: false, // used for drag-and-drop
      ignoreNextSwipe: false, // used for drag-and-drop
    };
  },

  computed: {
    // convert the events into a map of lists keyed by date
    eventsMap() {
      const map = {};
      // this.events.forEach(event => (map[ event.date ] = map[ event.date ] || []).push(event))
      this.events.forEach((event) => {
        if (!map[event.date]) {
          map[event.date] = [];
        }
        map[event.date].push(event);
        if (event.days) {
          let timestamp = parseTimestamp(event.date);
          let days = event.days;
          do {
            timestamp = addToDate(timestamp, { day: 1 });
            if (!map[timestamp.date]) {
              map[timestamp.date] = [];
            }
            map[timestamp.date].push(event);
          } while (--days > 0);
        }
      });
      // console.log("map example ", map);
      return map;
    },

    disabledAfter() {
      let ts = parseTimestamp("2023-10-04");
      ts = addToDate(ts, { day: 19 });
      return ts.date;
    },

    disabledBefore() {
      let ts = parseTimestamp("2023-10-04");
      ts = addToDate(ts, { day: -1 });
      return ts.date;
    },
  },

  methods: {
    badgeClasses(event, type) {
      const isHeader = type === "header";
      return {
        [`text-white bg-${event.bgcolor}`]: true,
        "full-width": !isHeader && (!event.side || event.side === "full"),
        "left-side": !isHeader && event.side === "left",
        "right-side": !isHeader && event.side === "right",
        "rounded-border": true,
      };
    },

    badgeStyles(
      event,
      type,
      timeStartPos = undefined,
      timeDurationHeight = undefined
    ) {
      const s = {};
      if (timeStartPos && timeDurationHeight) {
        s.top = timeStartPos(event.time) + "px";
        s.height = timeDurationHeight(event.duration) + "px";
      }
      // s["align-items"] = "flex-start";
      // console.log(s);
      return s;
    },

    getEvents(dt) {
      const events = this.eventsMap[dt] || [];
      // console.log("events vue 2 ", events);

      if (events.length === 1) {
        events[0].side = "full";
      } else if (events.length === 2) {
        // this example does no more than 2 events per day
        // check if the two events overlap and if so, select
        // left or right side alignment to prevent overlap
        const startTime = addToDate(parsed(events[0].date), {
          minute: parseTime(events[0].time),
        });
        const endTime = addToDate(startTime, { minute: events[0].duration });
        const startTime2 = addToDate(parsed(events[1].date), {
          minute: parseTime(events[1].time),
        });
        const endTime2 = addToDate(startTime2, { minute: events[1].duration });
        if (
          isBetweenDates(startTime2, startTime, endTime, true) ||
          isBetweenDates(endTime2, startTime, endTime, true)
        ) {
          events[0].side = "left";
          events[1].side = "right";
        } else {
          events[0].side = "full";
          events[1].side = "full";
        }
      }

      return events;
    },
    calendarNext() {
      this.$refs.calendar.next();
    },
    calendarPrev() {
      this.$refs.calendar.prev();
    },
    handleSwipe({ evt, ...info }) {
      if (this.dragging === false) {
        if (info.duration >= 30 && this.ignoreNextSwipe === false) {
          if (info.direction === "right") {
            this.calendarPrev();
          } else if (info.direction === "left") {
            this.calendarNext();
          }
        } else {
          this.ignoreNextSwipe = false;
        }
      }
      // stopAndPrevent(evt)
      evt.cancelable !== false && evt.preventDefault();
      evt.stopPropagation();
    },

    scrollToEvent(event) {
      this.$refs.calendar.scrollToTime(event.time, 350);
    },

    onToday() {
      this.$refs.calendar.moveToToday();
    },
    onPrev() {
      this.$refs.calendar.prev();
    },
    onNext() {
      this.$refs.calendar.next();
    },

    onMoved(data) {
      console.log("onMoved", data);
    },
    onChange(data) {
      // console.log("onChange", data);
    },
    onClickDate(data) {
      console.log("onClickDate", data);
    },
    onClickTime(data) {
      console.log("onClickTime", data);
    },
    onClickInterval(data) {
      console.log("onClickInterval", data);
    },
    onClickHeadIntervals(data) {
      console.log("onClickHeadIntervals", data);
    },
    onClickHeadDay(data) {
      console.log("onClickHeadDay", data);
    },
  },
});
</script>

<style lang="sass" scoped>
.my-event
  position: absolute
  font-size: 12px
  justify-content: center
  margin: 0 1px
  text-overflow: ellipsis
  overflow: hidden
  cursor: pointer

.title
  position: relative
  display: flex
  justify-content: center
  align-items: center
  height: 100%

.text-white
  color: white

.bg-blue
  background: blue

.bg-green
  background: green

.bg-orange
  background: orange

.bg-red
  background: red

.bg-teal
  background: teal

.bg-grey
  background: grey

.bg-purple
  background: purple

.full-width
  left: 0
  width: calc(100% - 2px)

.left-side
  left: 0
  width: calc(50% - 3px)

.right-side
  left: 50%
  width: calc(50% - 3px)

.rounded-border
  border-radius: 2px
</style>
