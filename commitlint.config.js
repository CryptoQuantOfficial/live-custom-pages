// Custom rules
const commitlintClickupRules = {
  taskIdEmpty: 'clickup-task-is-empty-rule',
  taskIdMinLength: 'clickup-task-id-min-length-rule',
  taskIdMaxLength: 'clickup-task-id-max-length-rule',
  taskIdCase: 'clickup-task-id-case-rule',
  taskIdSeparator: 'clickup-task-id-separator-rule',
  commitMessageSeparator: 'clickup-commit-message-separator-rule',
};

// Constants
const COMMIT_TASK_IDS_SEPARATOR = ',';
const TASK_ID_SEPARATOR = '-';
const TASK_ID_PREFIX = ['CU'];
const COMMIT_DESCRIPTION_SEPARATOR = '\n';

const parseCommitMessage = (rawCommitMessage) => {
  const commitMessage = rawCommitMessage
    .split(COMMIT_DESCRIPTION_SEPARATOR)
    .filter((commitMessageSeparatedPart) => commitMessageSeparatedPart)[0];
  const commitMessageParts = [
    commitMessage.replace(/\s.*/, ''),
    commitMessage.replace(/\S+\s/, ''),
  ];

  const rawCommitHeader = commitMessageParts.length >= 2 ? commitMessageParts[0] : '';
  const commitHeader = rawCommitHeader;
  const commitFooter =
    commitMessageParts.length > 2
      ? commitMessageParts.filter((_value, index) => index > 0).trim()
      : commitMessageParts[commitMessageParts.length - 1].trim();

  const commitTaskIds = commitHeader
    .replace(/\[/, '')
    .replace(/\]/, '')
    .split(COMMIT_TASK_IDS_SEPARATOR)
    .map((taskId) => {
      return taskId.replace(/^.*\//, '').trim();
    })
    .filter((taskId) => {
      return !!taskId && /cu-/i;
    });

  return {
    commitTaskIds,
    commitFooter,
    commitHeader,
  };
};

const taskIdEmpty = ({ raw }) => {
  if (!raw) return [false, 'Commit message should not be empty'];

  const commitMessage = parseCommitMessage(raw);

  return [
    commitMessage.commitTaskIds.length > 0,
    `the commit message muse provide minimum ont task id followthe commit message must provide minimum one task id, if task not have an id use a conventional task id e.g: "[CU-xxxxxx] My commit message"`,
  ];
};

const taskIdMinLength = ({ raw }, _when, value = 3) => {
  if (!raw) return [false, 'Commit message should not be empty'];

  const commitMessage = parseCommitMessage(raw);

  const nonValidTaskId = commitMessage.commitTaskIds.find((taskId) => taskId.length < value);

  return [!nonValidTaskId, `${nonValidTaskId} taskId must not be shorten than ${value} characters`];
};

const taskIdMaxLength = ({ raw }, _when, value = 9) => {
  if (!raw) return [false, 'Commit message should not be empty'];

  const commitMessage = parseCommitMessage(raw);

  const nonValidTaskId = commitMessage.commitTaskIds.find((taskId) => taskId.length > value);

  return [!nonValidTaskId, `${nonValidTaskId} taskId must not be loonger than ${value} characters`];
};

const taskIdCase = ({ raw }, _when, value = TASK_ID_PREFIX) => {
  if (!raw) return [false, 'Commit message should not be empty'];

  const commitMessage = parseCommitMessage(raw);

  const inValidTaskId =
    commitMessage.commitTaskIds.find((taskId) => {
      const taskIdArr = taskId.split(TASK_ID_SEPARATOR);

      return (
        taskIdArr[0] !== taskIdArr[0].toUpperCase() ||
        !value.includes(taskIdArr[0]) ||
        taskIdArr[1] !== taskIdArr[1].toLowerCase()
      );
    }) || '';

  return [!inValidTaskId, `${inValidTaskId} taskId must be clickup case e.g: CU-abc123`];
};

const taskIdSeparator = ({ raw }, _when, value = TASK_ID_SEPARATOR) => {
  if (!raw) return [false, 'Commit message should not be empty'];

  const commitMessage = parseCommitMessage(raw);

  const nonValidTaskId = commitMessage.commitTaskIds.find((taskId) => {
    return !new RegExp(TASK_ID_SEPARATOR).test(taskId);
  });

  return [
    !nonValidTaskId,
    `${nonValidTaskId} taskId header and footer must be separated with "${value}" e.g: CU-abc123`,
  ];
};

const commitMessageSeparator = ({ raw }) => {
  if (!raw) return [false, 'Commit message should not be empty'];

  const commitMessage = parseCommitMessage(raw);

  return [
    !!commitMessage.commitHeader && !!commitMessage.commitFooter,
    `Commit message parts must be separated with single space charactor e.g: CU-abc123 My commit message body`,
  ];
};

module.exports = {
  plugins: [
    {
      rules: {
        [commitlintClickupRules.taskIdEmpty]: taskIdEmpty,
        [commitlintClickupRules.taskIdMinLength]: taskIdMinLength,
        [commitlintClickupRules.taskIdMaxLength]: taskIdMaxLength,
        [commitlintClickupRules.taskIdCase]: taskIdCase,
        [commitlintClickupRules.taskIdSeparator]: taskIdSeparator,
        [commitlintClickupRules.commitMessageSeparator]: commitMessageSeparator,
      },
    },
  ],
  rules: {
    [commitlintClickupRules.taskIdEmpty]: [2, 'always'],
    [commitlintClickupRules.taskIdMinLength]: [2, 'always', 3],
    [commitlintClickupRules.taskIdMaxLength]: [2, 'always', 15],
    [commitlintClickupRules.taskIdCase]: [2, 'always', TASK_ID_PREFIX],
    [commitlintClickupRules.taskIdSeparator]: [2, 'always', TASK_ID_SEPARATOR],
    [commitlintClickupRules.commitMessageSeparator]: [2, 'always'],
  },
};
