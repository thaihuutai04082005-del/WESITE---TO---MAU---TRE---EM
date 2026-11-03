import { useLocation } from 'react-router-dom';
import { publicPage } from '../../../shared/publicRoutes.mjs';
import { PublicArticle } from '../seo/PublicContent';

export default function PublicInfo() {
  const { pathname } = useLocation();
  return <PublicArticle page={publicPage(pathname)} />;
}
