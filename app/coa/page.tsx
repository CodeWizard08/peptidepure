import { getContent } from '@/lib/content';
import COAGallery from '@/components/COAGallery';

export default async function COAPage() {
  const content = await getContent<any>('coa');
  return <COAGallery content={content} />;
}
