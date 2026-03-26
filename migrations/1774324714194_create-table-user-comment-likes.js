/* eslint-disable camelcase */

export const shorthands = undefined;

export async function up(pgm) {
  pgm.createTable('user_comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('user_comment_likes', 'unique_user_comment_like', {
    unique: ['user_id', 'comment_id'],
  });
}

export async function down(pgm) {
  pgm.dropTable('user_comment_likes');
}
