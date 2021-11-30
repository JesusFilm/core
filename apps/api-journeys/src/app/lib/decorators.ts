export function KeyAsId() {
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
            let childFunction = descriptor.value;
            descriptor.value = async function (){
                var result = await childFunction.apply(this, arguments);
                if (Array.isArray(result))
                  result.forEach(result => { result.id = result._key });
                else
                  result.id = result._key;
                return result;
            }
        }
    }

    