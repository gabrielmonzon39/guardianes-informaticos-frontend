<template>
  <div class="column">
    <div class="q-pr-lg q-pt-lg col-12 text-right">
      <q-btn color="secondary" label="Guardar Horarios" @click="saveSchedule" />
    </div>
    <div class="q-pa-md row">
      <div class="col-4 q-pa-sm" v-for="day in schedule" :key="day.day_of_week">
        <q-table
          :title="day.date"
          :columns="schedule_headers"
          :rows="day.day_schedule"
          row-key="time"
          :rows-per-page-options="[0]"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                <q-badge :color="col.color" :label="col.name" />
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td
                v-for="key in schedule_headers"
                :key="key.name"
                :props="props"
              >
                <q-badge
                  v-if="key.name == 'hora'"
                  :color="day_has_worker(props.row.workers) ? 'green' : 'red'"
                  :label="props.row.time"
                />
                <q-checkbox
                  v-else
                  v-model="props.row.workers[key.name]['has_schedule']"
                  @update:model-value="
                    toggleSchedule(
                      props.row.api_time,
                      props.row.workers[key.name]['worker_id'],
                      props.row.workers[key.name]['has_schedule']
                    )
                  "
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
}
.text-center {
  text-align: center !important;
}
</style>

<script>
import { ref } from "vue";
import { useQuasar } from "quasar";

export default {
  setup() {
    const $q = useQuasar();

    return {
      schedule: ref(null),
      worker_colors: ref(null),
      schedule_headers: ref(null),
    };
  },
  methods: {
    getClientWeekSchedule() {
      this.$axios
        .get(
          `${this.$api_url}/clients/${this.$route.params.client_id}/weeks/${this.$route.params.monday_date}/edit`
        )
        .then((response) => {
          this.schedule = response.data.schedules;
          this.worker_colors = response.data.worker_colors;
          this.schedule_headers = [];
          this.schedule_headers.push({
            name: "hora",
            required: true,
            label: "Hora",
            align: "left",
            color: "black",
            field: (row) => row.name,
            format: (val) => `${val}`,
            sortable: false,
          });
          // for key in worker colors add to headers
          for (let key in this.worker_colors) {
            this.schedule_headers.push({
              name: key,
              label: key,
              align: "center",
              color: this.worker_colors[key],
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    day_has_worker(workers_hash) {
      for (let key in workers_hash) {
        if (workers_hash[key]["has_schedule"] == true) {
          return true;
        }
      }
      return false;
    },
    toggleSchedule(time, worker_id, value) {
      console.log(time.split(" - ")[0], worker_id, value);
      this.$axios.post(`${this.$api_url}/workers/toggle-schedule`, {
        time: time.split(" - ")[0],
        worker_id: worker_id,
        value: value,
      });
    },
    saveSchedule() {
      this.$q.loading.show();
      this.$axios
        .post(`${this.$api_url}/confirm_schedules`, {
          client_id: this.$route.params.client_id,
          monday_date: this.$route.params.monday_date,
        })
        .then((response) => {
          this.$q.loading.hide();
          this.$router.push({
            name: "index",
            params: {
              client_id: this.$route.params.client_id,
              monday_date: this.$route.params.monday_date,
            },
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  created() {
    this.getClientWeekSchedule();
  },
  computed: {},
};
</script>
