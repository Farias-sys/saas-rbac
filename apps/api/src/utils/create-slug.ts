export default function generateSlug(text: string): string {
    // Convert to lower case
    let slug = text.toLowerCase();

    // Replace accented characters with their unaccented equivalents
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Remove all non-alphanumeric characters except hyphens
    slug = slug.replace(/[^a-z0-9\s-]/g, '');

    // Replace spaces and consecutive hyphens with a single hyphen
    slug = slug.trim().replace(/\s+/g, '-').replace(/-+/g, '-');

    return slug;
}