export function LegacyMarkup({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
