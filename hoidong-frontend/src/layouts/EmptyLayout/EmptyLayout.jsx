import { Outlet } from 'react-router-dom';

const EmptyLayout = () => {
  return (
    <div className="empty-layout">
      <Outlet />
    </div>
  );
};

export default EmptyLayout;
