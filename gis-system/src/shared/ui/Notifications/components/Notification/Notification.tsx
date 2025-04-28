import { Typography } from 'antd';
import clsx from 'clsx';
import { FC } from 'react';
import type { TypeOptions } from 'react-toastify/dist/types';

type TNotificationProps = {
  title: string | number;
  description?: string;
  type?: TypeOptions;
  className?: string;
};
export const Notification: FC<TNotificationProps> = ({ title, description, type = 'default', className = '' }) => (
  <div className={clsx('notification-message', `notification-message-${type}`, className)}>
    <Typography.Title className="mt-0" level={4}>
      {title}
    </Typography.Title>
    <Typography.Paragraph className="mb-0">{description}</Typography.Paragraph>
  </div>
);
