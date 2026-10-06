// Nằm dưới /admin/manage để không trùng route chặn (.)projects của trang chủ ([lang]/@overlay), vốn khớp cả /admin/projects.
import { notFound } from "next/navigation";
import { ResourceManager } from "@/components/admin/resource-manager";
import { resourceByName } from "@/lib/admin/resources";

export default async function ResourcePage({ params }: PageProps<"/admin/manage/[resource]">) {
  const { resource } = await params;
  if (!resourceByName(resource)) notFound();
  return <ResourceManager resource={resource} />;
}
