import { Head } from '@inertiajs/react';

type SeoHeadProps = {
    title?: string;
    description?: string;
    image?: string | null;
    url?: string;
    type?: string;
    siteName?: string;
    overrideTitle?: string;
};

export function SeoHead({ title, description, image, url, type = 'website', siteName = 'Inkwell', overrideTitle }: SeoHeadProps) {
    const seoTitle = overrideTitle || title || 'Inkwell';

    return (
        <>
            <Head title={seoTitle} />

            <meta name="description" content={description || ''} />

            <meta
                property="og:title"
                content={title || siteName}
            />

            <meta
                property="og:description"
                content={description || ''}
            />

            <meta property="og:type" content={type} />

            {image && (
                <meta property="og:image" content={image} />
            )}

            <meta property="og:url" content={url || window.location.href} />

            <meta property="og:site_name" content={siteName} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seoTitle} />
            <meta name="twitter:description" content={description || ''} />
            {image && (
                <meta name="twitter:image" content={image} />
            )}

            <link rel="canonical" content={url || window.location.href} />
        </>
    );
}