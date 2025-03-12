import { useState } from 'react';
import { 
  ChevronRight, ChevronDown, File, Folder, 
  MousePointer, Type, Box, AlignLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ElementsTreeProps {
  elements: any[];
}

export function ElementsTree({ elements }: ElementsTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  
  // Find page/parent elements
  const pageElements = elements.filter(el => el.type === 'page');
  
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const selectElement = (element: any) => {
    setSelectedElement(element);
  };
  
  const getElementIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <Folder className="h-4 w-4 text-muted-foreground" />;
      case 'button':
        return <MousePointer className="h-4 w-4 text-muted-foreground" />;
      case 'input':
        return <Type className="h-4 w-4 text-muted-foreground" />;
      case 'div':
        return <Box className="h-4 w-4 text-muted-foreground" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const renderElement = (element: any, level: number = 0) => {
    const children = elements.filter(el => el.parent_id === element.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds[element.id] || false;
    const isSelected = selectedElement?.id === element.id;
    
    return (
      <div key={element.id} className="select-none">
        <div 
          className={cn(
            "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-muted",
            isSelected && "bg-muted"
          )}
          style={{ paddingLeft: `${level * 12 + 4}px` }}
          onClick={() => selectElement(element)}
        >
          {hasChildren ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(element.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}
          
          {getElementIcon(element.type)}
          <span className="ml-2 text-sm">{element.name}</span>
          <span className="ml-2 text-xs text-muted-foreground">{element.type}</span>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {children.map(child => renderElement(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="font-medium text-sm mb-2">Elements Hierarchy</div>
          <div className="max-h-[400px] overflow-y-auto border rounded-md p-2">
            {pageElements.length > 0 ? (
              <div>
                {pageElements.map(page => renderElement(page))}
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                No elements found in this POM
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="font-medium text-sm mb-2">Element Properties</div>
          {selectedElement ? (
            <div className="border rounded-md p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{selectedElement.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium">{selectedElement.type}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Selector</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted p-1 rounded">
                    {selectedElement.selector}
                  </code>
                  <span className="text-xs bg-primary/10 text-primary px-1 rounded">
                    {selectedElement.selector_type}
                  </span>
                </div>
              </div>
              
              {selectedElement.properties && (
                <div>
                  <p className="text-xs text-muted-foreground">Properties</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedElement.properties, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-md p-4 text-center text-muted-foreground">
              <AlignLeft className="mx-auto h-8 w-8 mb-2" />
              <p>Select an element to view its properties</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}