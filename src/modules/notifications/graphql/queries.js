const notificationFields = `
  _id
  notifType
  title
  link
  content
  createdUser {
    _id
    username
    details
    email
  }

  receiver
  date
  isRead
`;

const listParamsDef = `
  $limit: Int,
  $page: Int,
  $perPage: Int,
  $requireRead: Boolean,
  $title: String,
`;

const listParamsValue = `
  limit: $limit,
  page: $page,
  perPage: $perPage,
  requireRead: $requireRead,
  title: $title,
`;

const notifications = `
  query notifications(${listParamsDef}) {
    notifications(${listParamsValue}) {
      ${notificationFields}
    }
  }
`;

const notificationCounts = `
  query notificationCounts($requireRead: Boolean) {
    notificationCounts(requireRead: $requireRead)
  }
`;

export default {
  notifications,
  notificationCounts
};
