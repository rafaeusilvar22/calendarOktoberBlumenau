<template>
  <div class="subcontent">
    <div
      style="
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
      "
    >
      <div
        style="
          max-width: 800px;
          width: 100%;
          display: flex;
          flex-direction: column;
        "
      >
        <div class="q-ma-sm q-gutter-sm row justify-center">
          <q-select
            filled
            v-model="selected"
            :options="options"
            label="Modo de
            visualização"
            emit-value
            map-options
            style="min-width: 180px"
            transition-show="scale"
            transition-hide="scale"
          />
          <q-select
            v-model="theme"
            label="Choose a theme"
            outlined
            dense
            map-options
            emit-value
            options-dense
            :options="themesList"
            class="button"
            style="min-width: 180px"
          />
        </div>
        <div class="title-bar" style="display: flex">
          <q-btn
            tabindex="0"
            class="date-button direction-button direction-button__left"
            @click="onPrev"
            icon="arrow_back_ios"
          >
            <span class="q-calendar__focus-helper" tabindex="-1" />
          </q-btn>
          <div class="dates-holder">
            <transition :name="transition" appear>
              <div :key="parsedStart.date" class="internal-dates-holder">
                <div v-for="day in days" :key="day.date" :style="dayStyle">
                  <button
                    tabindex="0"
                    style="width: 100%"
                    :class="dayClass(day)"
                    @click="
                      selectedDate = day.date;
                      transition = '';
                    "
                  >
                    <span class="q-calendar__focus-helper" tabindex="-1" />
                    <div style="width: 100%">
                      {{ monthFormatter(day, true) }}
                    </div>
                    <div style="width: 100%; font-size: 16px; font-weight: 700">
                      {{ dayFormatter(day, false) }}
                    </div>
                    <div style="width: 100%; font-size: 10px">
                      {{ weekdayFormatter(day, true) }}
                    </div>
                  </button>
                </div>
              </div>
            </transition>
          </div>
          <q-btn
            tabindex="0"
            class="date-button direction-button direction-button__right"
            @click="onNext"
            icon="arrow_forward_ios"
          >
            <span class="q-calendar__focus-helper" tabindex="-1" />
          </q-btn>
        </div>
        <q-calendar-day
          ref="calendar"
          v-model="selectedDate"
          :view="selected"
          :max-days="selected === 'day' ? 1 : 0"
          bordered
          animated
          locale="pt-BR"
          :hour24-format="hour24"
          :interval-start="16"
          :interval-minutes="30"
          :interval-count="50"
          :interval-height="40"
          :disabled-after="disabledAfter"
          :disabled-before="disabledBefore"
          :style="theme"
          style="height: 400px"
          @change="onChange"
          @moved="onMoved"
          @click-date="onClickDate"
          @click-time="onClickTime"
          @click-interval="onClickInterval"
          @click-head-intervals="onClickHeadIntervals"
          @click-head-day="onClickHeadDay"
          v-touch-swipe.mouse.left.right="handleSwipe"
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
              <template
                v-for="event in eventsMap[timestamp.date]"
                :key="event.id"
              >
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
                  <div class="title q-calendar__ellipsis">
                    {{ event.title }}
                    <q-tooltip>{{ event.details }}</q-tooltip>
                  </div>
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
                    cursor: pointer;
                  "
                  @click="scrollToEvent(event)"
                >
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
                @click="handleDetailsEvents(event)"
              >
                <span class="title q-calendar__ellipsis">
                  {{ event.title }}

                  <!-- <q-tooltip>{{ event.details }}</q-tooltip> -->
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
  createDayList,
  createNativeLocaleFormatter,
  getEndOfWeek,
  getStartOfWeek,
  getWeekdaySkips,
  parseTimestamp,
  isBetweenDates,
  today,
  parsed,
  parseTime,
} from "@quasar/quasar-ui-qcalendar/src/index.js";
import "@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass";
import "@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass";
import "@quasar/quasar-ui-qcalendar/src/QCalendarDay.sass";

import { defineComponent, ref, reactive, computed } from "vue";
import useDialog from "src/composables/useDialog";

export default defineComponent({
  name: "DayCustomHeader",
  components: {
    QCalendarDay,
  },
  setup() {
    const { DialogConfirm } = useDialog();

    const selected = ref("day");
    const options = ref([
      { label: "Dia", value: "day" },
      { label: "Semana", value: "week" },
    ]);
    const hour24 = true;
    const selectedDate = ref("2023-10-04"),
      calendar = ref(null),
      weekdays = reactive([0, 1, 2, 3, 4, 5, 6]),
      locale = ref("pt-BR"),
      monthFormatter = monthFormatterFunc(),
      dayFormatter = dayFormatterFunc(),
      weekdayFormatter = weekdayFormatterFunc(),
      transitionPrev = ref("slide-left"),
      transitionNext = ref("slide-right"),
      transition = ref("");

    const dragging = false;
    let ignoreNextSwipe = false;

    const theme = ref({});

    const themes = {
      default: {},
      teal: {
        "--calendar-scrollbar-track": "#4db6ac",
        "--calendar-scrollbar-thumb": "#004d40",
        "--calendar-scrollbar-thumb-hover": "#00897b",
        "--calendar-scrollbar-track-dark": "#4db6ac",
        "--calendar-scrollbar-thumb-dark": "#004d40",
        "--calendar-scrollbar-thumb-hover-dark": "#00897b",
        "--calendar-border": "#4db6ac 1px solid",
        "--calendar-border-dark": "#e0f2f1 1px solid",
        "--calendar-border-section": "#80cbc4 1px dashed",
        "--calendar-border-section-dark": "#80cbc4 1px dashed",
        "--calendar-border-current": "#4db6ac 2px solid",
        "--calendar-border-current-dark": "#1de9b6 2px solid",
        "--calendar-mini-range-connector-hover-border": "#027BE3 1px dashed",
        "--calendar-mini-range-connector-hover-border-dark":
          "#ffff66 1px dashed",
        "--calendar-color": "#004d40",
        "--calendar-color-dark": "#e0f2f1",
        "--calendar-background": "#e0f2f1",
        "--calendar-background-dark": "#004d40",
        "--calendar-current-color": "#027BE3",
        "--calendar-current-color-dark": "#ffff66",
        "--calendar-current-background": "#00000000",
        "--calendar-current-background-dark": "#004d40",
        "--calendar-disabled-date-color": "#e0f2f1",
        "--calendar-disabled-date-color-dark": "#bebebe",
        "--calendar-disabled-date-background": "#80cbc4",
        "--calendar-disabled-date-background-dark": "#121212",
        "--calendar-active-date-color": "#000000",
        "--calendar-active-date-color-dark": "#ffff66",
        "--calendar-active-date-background": "#1de9b6",
        "--calendar-active-date-background-dark": "#4db6ac",
        "--calendar-outside-color": "#004d40",
        "--calendar-outside-color-dark": "#bebebe",
        "--calendar-outside-background": "#00000000",
        "--calendar-outside-background-dark": "#121212",
        "--calendar-selected-color": "#027BE3",
        "--calendar-selected-color-dark": "#027BE3",
        "--calendar-selected-background": "#cce7ff",
        "--calendar-selected-background-dark": "#cce7ff",
        "--calendar-mini-selected-color": "unset",
        "--calendar-mini-selected-color-dark": "#027BE3",
        "--calendar-mini-selected-background": "unset",
        "--calendar-mini-selected-background-dark": "#cce7ff",
        "--calendar-mini-selected-label-color": "#027BE3",
        "--calendar-mini-selected-label-color-dark": "#cce7ff",
        "--calendar-mini-selected-label-background": "#cce7ff",
        "--calendar-mini-selected-label-background-dark": "#027BE3",
        "--calendar-range-color": "#027BE3",
        "--calendar-range-color-dark": "#027BE3",
        "--calendar-range-background": "#cce7ff",
        "--calendar-range-background-dark": "#cce7ff",
        "--calendar-mini-range-color": "#cce7ff",
        "--calendar-mini-range-color-dark": "#027BE3",
        "--calendar-mini-range-background": "unset",
        "--calendar-mini-range-background-dark": "unset",
        "--calendar-mini-range-label-color": "#cce7ff",
        "--calendar-mini-range-label-color-dark": "#027BE3",
        "--calendar-mini-range-label-background": "#cce7ff",
        "--calendar-mini-range-label-background-dark": "#cce7ff",
        "--calendar-mini-range-connector-color": "#cce7ff",
        "--calendar-mini-range-connector-color-dark": "#ffff66",
        "--calendar-mini-range-hover-color": "#027BE3",
        "--calendar-mini-range-hover-color-dark": "#ffff66",
        "--calendar-mini-range-firstlast-color": "#cce7ff",
        "--calendar-mini-range-firstlast-color-dark": "#cce7ff",
        "--calendar-mini-range-firstlast-background": "unset",
        "--calendar-mini-range-firstlast-background-dark": "#cce7ff",
        "--calendar-mini-range-firstlast-label-color": "#cce7ff",
        "--calendar-mini-range-firstlast-label-color-dark": "#cce7ff",
        "--calendar-mini-range-firstlast-label-background": "#027BE3",
        "--calendar-mini-range-firstlast-label-background-dark": "#ffff66",
        "--calendar-intervals-width": "56px",
        "--calendar-work-week-width": "30px",
        "--calendar-mini-work-week-width": "30px",
        "--calendar-work-week-font-size": "1.0em",
        "--calendar-head-font-weight": "600",
      },
    };
    const events = ref([
      {
        id: 1,
        title: "Abertura – Som Mecânico",
        details: "SETOR 04 - SPATEN PLATZ",
        date: "2023-10-04",
        time: "8:00",
        duration: 60,
        bgcolor: "green-10",
        icon: "fas fa-handshake",
      },
      {
        id: 2,
        title: "Abertura – Som Mecânico",
        details: "SETOR 03",
        date: "2023-10-04",
        time: "18:00",
        duration: 60,
        bgcolor: "green-10",
        icon: "fas fa-hamburger",
      },
      {
        id: 3,
        title: "Banda do Caneco",
        details: "SETOR 01",
        date: "2023-10-04",
        time: "19:00",
        duration: 60,
        bgcolor: "red-10",
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
    ]);

    const themesList = computed(() => {
      const list = [];
      Object.keys(themes).forEach((theme) => {
        list.push({
          label: theme,
          value: { ...themes[theme] },
        });
      });
      return list;
    });

    const weekdaySkips = computed(() => {
      return getWeekdaySkips(weekdays);
    });

    const parsedStart = computed(() => {
      if (selectedDate.value) {
        return getStartOfWeek(
          parseTimestamp(selectedDate.value),
          weekdays,
          today2.value
        );
      }
      return undefined;
    });

    const parsedEnd = computed(() => {
      if (selectedDate.value) {
        return getEndOfWeek(
          parseTimestamp(selectedDate.value),
          weekdays,
          today2.value
        );
      }
      return undefined;
    });

    const today2 = computed(() => {
      return parseTimestamp(today());
    });

    const days = computed(() => {
      if (parsedStart.value && parsedEnd.value) {
        return createDayList(
          parsedStart.value,
          parsedEnd.value,
          today2.value,
          weekdaySkips.value
        );
      }
      return [];
    });

    const dayStyle = computed(() => {
      const width = 100 / weekdays.length + "%";
      return {
        width,
      };
    });

    // convert the events into a map of lists keyed by date
    const eventsMap = computed(() => {
      const map = {};
      // this.events.forEach(event => (map[ event.date ] = map[ event.date ] || []).push(event))
      events.value.map((event) => {
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
      return map;
    });

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

    const badgeClasses = (event, type) => {
      const isHeader = type.value === "header";
      return {
        [`text-amber-14 bg-${event.bgcolor}`]: true,
        "full-width": !isHeader && (!event.side || event.side === "full"),
        "left-side": !isHeader && event.side === "left",
        "right-side": !isHeader && event.side === "right",
        "rounded-border": true,
      };
    };

    const badgeStyles = (
      event,
      type,
      timeStartPos = undefined,
      timeDurationHeight = undefined
    ) => {
      const s = {};
      if (timeStartPos && timeDurationHeight) {
        s.top = timeStartPos(event.time) + "px";
        s.height = timeDurationHeight(event.duration) + "px";
      }
      s["align-items"] = "flex-start";
      // console.log(s);
      return s;
    };

    const getEvents = (dt) => {
      const events = eventsMap.value[dt] || [];

      if (events.length === 1) {
        events[0].side = "full";
      } else if (events.length >= 2) {
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
      // console.log(events);
      return events;
    };

    const scrollToEvent = (event) => {
      calendar.value.scrollToTime(event.time, 350);
    };
    const handleDetailsEvents = (event) => {
      DialogConfirm(event);
    };

    function onPrev() {
      const ts = addToDate(parsedStart.value, { day: -7 });
      selectedDate.value = ts.date;
      transition.value = "q-calendar--" + transitionPrev.value;
    }

    function onNext() {
      const ts = addToDate(parsedStart.value, { day: 7 });
      selectedDate.value = ts.date;
      transition.value = "q-calendar--" + transitionNext.value;
    }

    function dayClass(day) {
      return {
        "date-button": true,
        "selected-date-button": selectedDate.value === day.date,
      };
    }

    function monthFormatterFunc() {
      const longOptions = { timeZone: "UTC", month: "long" };
      const shortOptions = { timeZone: "UTC", month: "short" };

      return createNativeLocaleFormatter(locale.value, (_tms, short) =>
        short ? shortOptions : longOptions
      );
    }

    function weekdayFormatterFunc() {
      const longOptions = { timeZone: "UTC", weekday: "long" };
      const shortOptions = { timeZone: "UTC", weekday: "short" };

      return createNativeLocaleFormatter(locale.value, (_tms, short) =>
        short ? shortOptions : longOptions
      );
    }

    function dayFormatterFunc() {
      const longOptions = { timeZone: "UTC", day: "2-digit" };
      const shortOptions = { timeZone: "UTC", day: "numeric" };

      return createNativeLocaleFormatter(locale.value, (_tms, short) =>
        short ? shortOptions : longOptions
      );
    }

    function onMoved(data) {
      // console.log("onMoved", data);
    }
    function onChange(data) {
      // console.log("onChange", data);
    }
    function onClickDate(data) {
      // console.log("onClickDate", data);
    }
    function onClickTime(data) {
      // console.log("onClickTime", data);
    }
    function onClickInterval(data) {
      // console.log("onClickInterval", data);
    }
    function onClickHeadIntervals(data) {
      // console.log("onClickHeadIntervals", data);
    }
    function onClickHeadDay(data) {
      // console.log("onClickHeadDay", data);
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

    return {
      selected,
      options,
      hour24,
      selectedDate,
      calendar,
      locale,
      theme,
      themes,
      themesList,
      monthFormatter,
      dayFormatter,
      weekdayFormatter,
      transitionPrev,
      transitionNext,
      transition,
      dragging,
      ignoreNextSwipe,
      parsedStart,
      days,
      events,
      dayStyle,
      eventsMap,
      disabledAfter,
      disabledBefore,
      scrollToEvent,
      handleDetailsEvents,
      badgeClasses,
      badgeStyles,
      getEvents,
      onPrev,
      onNext,
      dayClass,
      onMoved,
      onChange,
      onClickDate,
      onClickTime,
      onClickInterval,
      onClickHeadIntervals,
      onClickHeadDay,
      handleSwipe,
    };
  },
});
</script>

<style>
.title-bar {
  position: relative;
  width: 100%;
  height: 70px;
  background: #005a00;
  /* display: flex; */
  /* flex-direction: row; */
  /* flex: 1 0 100%; */
  /* justify-content: space-between; */
  /* align-items: center; */
  overflow: hidden;
  border-radius: 3px;
  user-select: none;
}

.dates-holder {
  position: relative;
  width: 100%;
  align-items: center;
  display: flex;
  justify-content: space-between;
  color: #fff;
  overflow: hidden;
  user-select: none;
}

.internal-dates-holder {
  position: relative;
  width: 100%;
  display: inline-flex;
  flex: 1 1 100%;
  flex-direction: row;
  justify-content: space-between;
  overflow: hidden;
  user-select: none;
}

.direction-button {
  background: red;
  color: white;
  width: 40px;
  max-width: 50px !important;
}

/* .direction-button__left{
  &:before
    content: '<';
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    font-weight: 900;
    font-size: 3em;
} */

/* .direction-button__right{
  &:before
    content: '>';
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    font-weight: 900;
    font-size: 3em;
} */

.my-event {
  position: absolute;
  font-size: 12px;
  justify-content: center;
  margin: 0 1px;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
}
.title {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.text-white {
  color: white;
}

.bg-blue {
  background: blue;
}

.bg-green {
  background: #005a00;
}

.bg-orange {
  background: orange;
}

.bg-red {
  background: red;
}
.bg-teal {
  background: teal;
}

.bg-grey {
  background: grey;
}

.bg-purple {
  background: purple;
}
.full-width {
  left: 0;
  width: calc(100% - 2px);
}
.left-side {
  left: 0;
  width: calc(50% - 3px);
}
.right-side {
  left: 50%;
  width: calc(50% - 3px);
}
.rounded-border {
  border-radius: 2px;
}
.date-button {
  color: #ffd800;
  background: #005a00;
  z-index: 2;
  height: 100%;
  outline: 0;
  cursor: pointer;
  border-radius: 3px;
  display: inline-flex;
  flex: 1 0 auto;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  border: 0;
  vertical-align: middle;
  padding: 0;
  font-size: 14px;
  line-height: 1.715em;
  text-decoration: none;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
  user-select: none;
}

.selected-date-button {
  color: #ffd800;
  background: #b71c1c !important;
}
</style>
