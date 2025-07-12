# admin_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from item.models import IteamReport, Item
from item.serializers import ItemReportSerializer, ItemListSerializer


@api_view(['GET'])
@permission_classes([IsAdminUser])
def reported_items(request):
    """
    Admin-only endpoint that lists every report in the system.
    """
    reports = IteamReport.objects.select_related('item', 'reported_by', 'reviewed_by').all()
    serializer = ItemReportSerializer(reports, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def clear_reported_item(request, item_id):
    """
    Delete every ItemReport row that points to the given item_id.
    Only admins can call this.
    """
    # delete all reports tied to this item
    deleted, _ = IteamReport.objects.filter(item_id=item_id).delete()
    if deleted:
        return Response(
            {"detail": f"{deleted} report(s) cleared for item {item_id}"},
            status=status.HTTP_204_NO_CONTENT
        )
    return Response(
        {"detail": "No reports found for this item"},
        status=status.HTTP_404_NOT_FOUND
    )
