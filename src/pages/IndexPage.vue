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
          <template #week="{ scope: { timestamp } }">
            <template
              v-for="a in getAgenda(timestamp)"
              :key="timestamp.date + a.time"
            >
              <div
                :label="a.time"
                class="justify-start q-ma-sm shadow-5 bg-grey-6"
                style="margin-top: 25px"
              >
                <div
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
                </div>
                <div class="col-12 q-px-sm">
                  <strong>{{ a.time }}</strong>
                </div>
                <div
                  v-if="a.desc"
                  class="col-12 q-px-sm"
                  style="font-size: 10px"
                >
                  {{ a.desc }}
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
      agenda = {
        // value represents day of the week
        3: [
          {
            time: "18:00",
            avatar:
              "https://as1.ftcdn.net/v2/jpg/02/22/79/96/1000_F_222799673_m5MWq5Z9MdKYrJrt5OH3MFhCW7hTT2S6.jpg",
            desc: "Abertura – Som mecânico",
          },
          {
            time: "08:30",
            avatar: "https://cdn.quasar.dev/img/avatar.png",
            desc: "Meeting with HR",
          },
          {
            time: "10:00",
            avatar: "https://cdn.quasar.dev/img/avatar1.jpg",
            desc: "Meeting with Karen",
          },
        ],
        4: [
          {
            time: "11:30",
            avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
            desc: "Meeting with Alisha",
          },
          {
            time: "17:00",
            avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
            desc: "Meeting with Sarah",
          },
        ],
        5: [
          {
            time: "08:00",
            desc: "Stand-up SCRUM",
            avatar: "https://cdn.quasar.dev/img/material.png",
          },
          {
            time: "09:00",
            avatar: "https://cdn.quasar.dev/img/boy-avatar.png",
          },
          {
            time: "10:00",
            desc: "Sprint planning",
            avatar: "https://cdn.quasar.dev/img/material.png",
          },
          {
            time: "13:00",
            avatar: "https://cdn.quasar.dev/img/avatar1.jpg",
          },
        ],
        6: [
          {
            time: "09:00",
            avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
          },
          {
            time: "10:00",
            avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
          },
          {
            time: "13:00",
            avatar: "https://cdn.quasar.dev/img/material.png",
          },
        ],
        7: [
          {
            time: "08:00",
            avatar: "https://cdn.quasar.dev/img/boy-avatar.png",
          },
          {
            time: "09:00",
            avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
          },
          {
            time: "09:30",
            avatar: "https://cdn.quasar.dev/img/avatar4.jpg",
          },
          {
            time: "10:00",
            avatar: "https://cdn.quasar.dev/img/avatar5.jpg",
          },
          {
            time: "11:30",
            avatar: "https://cdn.quasar.dev/img/material.png",
          },
          {
            time: "13:00",
            avatar: "https://cdn.quasar.dev/img/avatar6.jpg",
          },
          {
            time: "13:30",
            avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
          },
          {
            time: "14:00",
            avatar: "https://cdn.quasar.dev/img/linux-avatar.png",
          },
          {
            time: "14:30",
            avatar: "https://cdn.quasar.dev/img/avatar.png",
          },
          {
            time: "15:00",
            avatar: "https://cdn.quasar.dev/img/boy-avatar.png",
          },
          {
            time: "15:30",
            avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
          },
          {
            time: "16:00",
            avatar: "https://cdn.quasar.dev/img/avatar6.jpg",
          },
        ],
      };

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
      dragging,
      ignoreNextSwipe,
      disabledAfter,
      disabledBefore,
      handleSwipe,
      onClickTime,
      onToday,
      onPrev,
      onNext,
      agenda,
    };
  },
});
</script>
