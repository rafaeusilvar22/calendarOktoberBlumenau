<!-- eslint-disable vue/valid-v-slot -->

<template>
  <div class="subcontent">
    <!-- <button @click="onNext">NEXT</button> -->
    <div class="q-ma-sm q-gutter-sm row justify-center">
      <q-select
        v-model="selectedView"
        label="Modo de Visualização"
        outlined
        dense
        options-dense
        :disable="selectedCalendar === 'month'"
        :options="['day', 'week', 'month']"
        class="button"
        style="min-width: 180px"
      />
    </div>

    <div class="row justify-center">
      <div style="display: flex; max-width: 800px; width: 100%; height: 400px">
        <QCalendarDay
          use-navigation
          hoverable
          focusable
          :focus-type="['interval', 'weekday']"
          ref="calendar"
          v-model="selectedDate"
          view="week"
          :weekdays="[1, 2, 3, 4, 5, 6, 7, 0]"
          :hour24-format="hour24"
          :day-min-height="200"
          :interval-start="16"
          :interval-minutes="30"
          :interval-count="50"
          :disabled-after="disabledAfter"
          :disabled-before="disabledBefore"
          bordered
          short-weekday-label
          animated
          locale="pt-BR"
          @click-time="onClickTime"
          v-touch-swipe.mouse.left.right="handleSwipe"
          transition-prev="slide-right"
          transition-next="slide-left"
        >
          <template #day-body="{ scope: { timestamp } }">
            <template
              v-for="event in eventsMap[timestamp.date]"
              :key="event.id"
            >
              <div
                :label="event.title"
                class="justify-start q-ma-sm shadow-5 bg-grey-6"
                style="margin-top: 25px"
              >
                <!-- <div
                  v-if="a.avatar"
                  class="row justify-center"
                  style="margin-top: 30px; width: 100%"
                >
                  <q-avatar
                    style="
                      margin-top: -50px;
                      margin-bottom: 10px;
                      font-size: 60px;
                    "
                  >
                    <img :src="a.avatar" style="border: #9e9e9e solid 5px" />
                  </q-avatar>
                </div> -->
                <!-- <div class="col-12 q-px-sm">
                  <strong>{{ a.time }}</strong>
                </div> -->
                <div
                  v-if="event.title"
                  class="col-12 q-px-sm"
                  style="font-size: 10px"
                >
                  {{ event.title }}
                </div>
              </div>
            </template>
          </template>
        </QCalendarDay>
      </div>
    </div>
  </div>
</template>
<style src="@quasar/quasar-ui-qcalendar/dist/QCalendarDay.min.css"></style>
<script>
import { defineComponent, ref, computed, reactive, onBeforeMount } from "vue";
import "@quasar/quasar-ui-qcalendar/dist/QCalendarTransitions.css";
import {
  QCalendarDay,
  today,
  addToDate,
  parseTimestamp,
  isBetweenDates,
  parsed,
} from "@quasar/quasar-ui-qcalendar/src/index.js";
import "@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass";
import "@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass";
import "@quasar/quasar-ui-qcalendar/src/QCalendar.sass";
import { event } from "quasar";

export default defineComponent({
  name: "CalendarAll",
  components: {
    QCalendarDay,
  },
  setup() {
    const hour24 = true;
    const dragging = false;
    let ignoreNextSwipe = false;
    const selectedCalendar = ref("agenda"),
      selectedView = ref("week"),
      calendar = ref(null),
      selectedDate = ref("2023-10-04"), // seleted day
      startDate = ref("2023-10-04"),
      events = [
        {
          id: 1,
          title: "Abertura – Som mecânico",
          details: "Time to pitch my idea to the company",
          date: "2023-10-04",
          time: "09:00",
          duration: 120,
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
          details: "Teaching Javascript 101",
          date: "2023-10-06",
          time: "13:00",
          duration: 240,
          bgcolor: "blue",
          icon: "fas fa-chalkboard-teacher",
        },
        {
          id: 4,
          title: "Abertura – Som mecânico",
          details: "Meet GF for dinner at Swanky Restaurant",
          date: "2023-10-07",
          time: "19:00",
          duration: 180,
          bgcolor: "teal-2",
          icon: "fas fa-utensils",
        },
      ];

    // doc about computed vue 3
    // https://vuejs.org/guide/essentials/computed.html#basic-example
    const disabledAfter = computed(() => {
      let ts = parseTimestamp("2023-10-04");
      ts = addToDate(ts, { day: 19 });
      return ts.date;
    });

    const disabledBefore = computed(() => {
      let ts = parseTimestamp("2023-10-04");
      ts = addToDate(ts, { day: -1 });
      return ts.date;
    });

    const eventsMap = computed(() => {
      const map = {};
      events.forEach((event) => {
        if (!map[event.data]) {
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
      return map;
    });
    const onClickTime = () => {
      console.log("onClickTime");
    };

    function onPrev() {
      calendar.value.prev();
    }
    function onNext() {
      calendar.value.next();
    }

    // Doc about swipe
    // https://quasar.dev/vue-directives/touch-swipe/
    const handleSwipe = ({ evt, ...info }) => {
      if (dragging === false) {
        if (info.duration >= 30 && ignoreNextSwipe === false) {
          if (info.direction === "right") {
            onPrev();
          } else if (info.direction === "left") {
            onNext();
          }
        } else {
          ignoreNextSwipe = false;
        }
      }
      // stopAndPrevent(evt)
      evt.cancelable !== false && evt.preventDefault();
      evt.stopPropagation();
    };

    function onToday() {
      calendar.value.moveToToday();
    }

    // onBeforeMount(() => {
    //   // adjust all the dates for the current month so examples don't expire
    // });

    return {
      selectedDate,
      selectedCalendar,
      selectedView,
      calendar,
      hour24,
      events,
      dragging,
      ignoreNextSwipe,
      disabledAfter,
      disabledBefore,
      eventsMap,
      handleSwipe,
      onClickTime,
      onToday,
      onPrev,
      onNext,
    };
  },
});
</script>
