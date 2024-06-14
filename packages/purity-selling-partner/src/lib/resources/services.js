module.exports = {
   services:{
    __versions:[
      'v1'
    ],
    __operations:[
      'getServiceJobByServiceJobId',
      'cancelServiceJobByServiceJobId',
      'completeServiceJobByServiceJobId',
      'getServiceJobs',
      'addAppointmentForServiceJobByServiceJobId',
      'rescheduleAppointmentForServiceJobByServiceJobId',
      'assignAppointmentResources',
      'setAppointmentFulfillmentData',
      'updateSchedule',
      'createReservation',
      'updateReservation',
      'cancelReservation',
      'createServiceDocumentUploadDestination'
    ],
    ...require('./versions/services/services_v1')
  }
};