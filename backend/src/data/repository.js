const prisma = require('./db');

async function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username }
  });
}

async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id }
  });
}

async function updateUserPassword(id, passwordHash) {
  return prisma.user.update({
    where: { id },
    data: {
      passwordHash,
      lastPasswordChangeAt: new Date()
    }
  });
}

async function listTrainings() {
  return prisma.training.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { username: true }
      },
      attendances: {
        select: {
          playerUsername: true,
          status: true,
          updatedAt: true
        }
      }
    }
  });
}

async function findTrainingById(id) {
  return prisma.training.findUnique({
    where: { id }
  });
}

async function createTraining(input, createdById) {
  return prisma.training.create({
    data: {
      ...input,
      createdById
    },
    include: {
      createdBy: {
        select: { username: true }
      }
    }
  });
}

async function closeTraining(id) {
  return prisma.training.update({
    where: { id },
    data: {
      isActive: false
    }
  });
}

async function deleteTraining(id) {
  return prisma.training.delete({
    where: { id }
  });
}

async function upsertTrainingAttendance(trainingId, playerUsername, status, updatedById) {
  return prisma.trainingAttendance.upsert({
    where: {
      trainingId_playerUsername: {
        trainingId,
        playerUsername
      }
    },
    update: {
      status,
      updatedById
    },
    create: {
      trainingId,
      playerUsername,
      status,
      updatedById
    }
  });
}

async function listAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { username: true }
      }
    }
  });
}

async function createAnnouncement(input, createdById) {
  return prisma.announcement.create({
    data: {
      ...input,
      createdById
    },
    include: {
      createdBy: {
        select: { username: true }
      }
    }
  });
}

async function deleteAnnouncement(id) {
  return prisma.announcement.delete({
    where: { id }
  });
}

async function listPolls() {
  return prisma.poll.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { username: true }
      },
      votes: {
        select: {
          optionIdx: true,
          userId: true,
          user: {
            select: { username: true }
          }
        }
      }
    }
  });
}

async function createPoll(input, createdById) {
  return prisma.poll.create({
    data: {
      ...input,
      createdById
    },
    include: {
      createdBy: {
        select: { username: true }
      },
      votes: {
        select: {
          optionIdx: true,
          userId: true,
          user: {
            select: { username: true }
          }
        }
      }
    }
  });
}

async function findPollById(id) {
  return prisma.poll.findUnique({
    where: { id }
  });
}

async function deletePoll(id) {
  return prisma.poll.delete({
    where: { id }
  });
}

async function closePoll(id) {
  return prisma.poll.update({
    where: { id },
    data: {
      active: false
    }
  });
}

async function upsertPollVote(pollId, userId, optionIdx) {
  return prisma.pollVote.upsert({
    where: {
      pollId_userId: {
        pollId,
        userId
      }
    },
    update: {
      optionIdx
    },
    create: {
      pollId,
      userId,
      optionIdx
    }
  });
}

async function createAuditLog(input) {
  return prisma.auditLog.create({
    data: input
  });
}

module.exports = {
  findUserByUsername,
  findUserById,
  updateUserPassword,
  listTrainings,
  findTrainingById,
  createTraining,
  closeTraining,
  deleteTraining,
  upsertTrainingAttendance,
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  listPolls,
  createPoll,
  findPollById,
  closePoll,
  deletePoll,
  upsertPollVote,
  createAuditLog
};