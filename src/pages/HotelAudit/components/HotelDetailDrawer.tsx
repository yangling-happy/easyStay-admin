import { Drawer } from 'antd';
import HotelDetailView from '@/components/HotelDetailView'; 
import type { Hotel } from '@/types/hotel';

interface Props {
  open: boolean;
  hotel: Hotel | null;
  onClose: () => void;
}

const HotelDetailDrawer = ({ open, hotel, onClose }: Props) => {
  return (
    <Drawer
      title="酒店详情"
      width={800}
      open={open}
      onClose={onClose}
    >
      {hotel ? <HotelDetailView data={hotel} type="audit" /> : null}
    </Drawer>
  );
};

export default HotelDetailDrawer;