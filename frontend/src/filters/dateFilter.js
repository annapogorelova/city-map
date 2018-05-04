import Vue from "vue";
import moment from 'moment';

export default Vue.filter("formatDate", function (date) {
    return moment(date, 'YYYY-MM-DD hh:mm').format('DD/MM/YYYY hh:mm');
});