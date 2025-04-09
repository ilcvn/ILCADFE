'use client';

import { getHumanResourceById } from '@/app/api/human-resource';
import withAuth from '@/app/components/withAuth';
import { HUMAN_RESOURCE_ROLE_STYLES, HUMAN_RESOURCE_ROLES_LABEL, type HumanResourceRole } from '@/app/enums/human-resource.enum';
import type HumanResource from '@/app/models/features/human-resource';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link2, Mail, Phone } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function HumanReSourceDetailPage() {
  const param = useParams();
  const [humanResource, setHumanResource] = useState<HumanResource | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const MAX_LENGTH = 400;

  const description = humanResource?.description || '';
  const shouldTruncate = description.length > MAX_LENGTH;

  const roles = humanResource?.role.split(',').map((role) => role.trim()) || [];

  useEffect(() => {
    const getHumanResourceDetail = async () => {
      try {
        const data = await getHumanResourceById(param?.id as string);
        if (data) {
          setHumanResource(data);
        } else {
          toast.error('Không tìm thấy thông tin người dùng');
        }
      } catch (error: any) {
        toast.error(error?.message || 'Mất kết nối với máy chủ, vui lòng đợi phản hồi');
      }
    };

    getHumanResourceDetail();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg border-dashed border-2 border-primary">
      <div className="flex items-start">
        <Avatar className="w-48 h-48 border-4 border-primary p-[2px] shadow-lg">
          <AvatarImage src={humanResource?.imgUrl} alt={humanResource?.fullName} className="rounded-full" />
          <AvatarFallback>{humanResource?.fullName[0]}</AvatarFallback>
        </Avatar>

        <div className="ml-6">
          <h1 className="text-3xl font-semibold text-blue-600">{humanResource?.fullName}</h1>

          <p className="text-gray-500 mt-2">
            {isExpanded || !shouldTruncate ? description : `${description.slice(0, MAX_LENGTH)}...`}
          </p>

          {shouldTruncate && (
            <Button variant="link" className="p-0 h-auto mt-1 text-blue-500" onClick={toggleExpand}>
              {isExpanded ? 'Thu gọn' : 'Xem thêm'}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-600 font-bold" />
              <span className="font-medium text-muted-foreground">{humanResource?.gmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-600 font-bold" />
              <span className="font-medium text-muted-foreground">{humanResource?.phone}</span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2">
            <span className="font-semibold">Chức vụ:</span>
            {roles.map((role, index) => {
              const roleLabel = HUMAN_RESOURCE_ROLES_LABEL[role as HumanResourceRole] || 'Không xác định';
              const roleStyle = HUMAN_RESOURCE_ROLE_STYLES[role as HumanResourceRole] || 'bg-gray-100 text-gray-500';

              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <Badge variant="outline" className={cn('flex items-center px-2 py-1 rounded-md w-max', roleStyle)}>
                    {roleLabel}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(HumanReSourceDetailPage);
