import { renderToStaticMarkup } from 'react-dom/server';
import { StaticPublicPage } from './PublicContent';

export const renderPublicPage = (page) => renderToStaticMarkup(<StaticPublicPage page={page} />);
