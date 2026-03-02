import { getContent } from '@/lib/content';
import COAGallery from '@/components/COAGallery';

export default function COAPage() {
  const content = getContent<any>('coa');
  return <COAGallery content={content} />;
}
