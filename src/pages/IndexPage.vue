<template>
  <div class="column">
    <div class="q-pr-lg q-pt-lg col-12 text-right">
      <q-btn
        v-if="selected_week"
        color="secondary"
        label="Editar Disponibilidad"
        :to="edit_route"
      />
    </div>
    <div class="q-pa-md row">
      <div class="col-4 q-pa-sm">
        <q-select
          v-model="client_selected"
          :options="clients"
          label="Seleccione un Cliente"
          @update:model-value="getClientWeeks"
        />
        <q-select
          v-if="client_selected"
          v-model="selected_week"
          :options="weeks"
          label="Seleccione una Semana"
          :hint="from_to_week"
          @update:model-value="getClientWeekSchedule"
        />
        <q-table
          class="q-mt-md"
          v-if="hours_by_worker"
          title="Horas por Trabajador"
          :columns="hours_by_worker_headers"
          :rows="hours_by_worker"
          :hide-bottom="true"
          :hide-header="true"
          row-key="name"
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div>
                <q-badge :color="props.row.color" :label="props.value" />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
      <div class="col-4 q-pa-sm" v-for="day in schedule" :key="day.day_of_week">
        <q-table
          :title="day.date"
          :rows="day.day_schedule"
          row-key="time"
          :rows-per-page-options="[0]"
          hide-header
          hide-bottom
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="time" :props="props" color="red">
                <q-badge
                  :color="props.row.worker == 'Sin Asignar' ? 'red' : 'green'"
                  :label="props.row.time"
                />
              </q-td>
              <q-td key="worker" :props="props" class="text-center">
                <q-icon
                  v-if="props.row.worker == 'Sin Asignar'"
                  name="warning"
                  color="warning"
                />
                <q-badge v-else :color="worker_colors[props.row.worker]">{{
                  props.row.worker
                }}</q-badge>
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

export default {
  setup() {
    return {
      client_selected: ref(null),
      clients: ref(null),
      weeks: ref(null),
      selected_week: ref(null),
      schedule: ref(null),
      worker_colors: ref(null),
      hours_by_worker: ref(null),
      hours_by_worker_headers: [
        {
          name: "name",
          required: true,
          label: "Nombre",
          field: (row) => row.name,
          format: (val) => `${val}`,
          sortable: true,
          align: "left",
        },
        {
          name: "hours",
          label: "Horas",
          align: "center",
          field: (row) => row.hours,
          sortable: true,
        },
      ],
      hours_by_worker_rows: [
        { name: "John", hours: "10" },
        { name: "Jane", hours: "10" },
        { name: "Joe", hours: "10" },
      ],
    };
  },
  methods: {
    getClients() {
      this.$axios
        .get(`${this.$api_url}/clients`)
        .then((response) => {
          this.clients = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getClientWeeks() {
      this.selected_week = null;
      this.hours_by_worker = null;
      this.$axios
        .get(`${this.$api_url}/clients/${this.client_selected.value}/weeks`)
        .then((response) => {
          this.weeks = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getClientWeekSchedule() {
      this.$axios
        .get(
          `${this.$api_url}/clients/${this.client_selected.value}/weeks/${this.selected_week.value}`
        )
        .then((response) => {
          this.schedule = response.data.schedules;
          this.worker_colors = response.data.worker_colors;
          this.hours_by_worker = response.data.hours_by_worker;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  created() {
    this.getClients();
  },
  computed: {
    from_to_week() {
      if (this.selected_week) {
        return `del ${this.selected_week.from} al ${this.selected_week.to}`;
      }
      return "";
    },
    edit_route() {
      if (this.client_selected && this.selected_week) {
        return `/edit/${this.client_selected.value}/${this.selected_week.value}`;
      }
      return null;
    },
  },
};
</script>
