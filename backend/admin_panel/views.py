# admin_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from item.models import IteamReport
from item.serializers import ItemReportSerializer

@api_view(['GET'])
@permission_classes([IsAdminUser])
def reported_items(request):
    """
    Admin-only endpoint that lists every report in the system.
    """
    reports = IteamReport.objects.select_related('item', 'reported_by', 'reviewed_by').all()
    serializer = ItemReportSerializer(reports, many=True)
    return Response(serializer.data)

